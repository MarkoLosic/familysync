import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Home, Briefcase, School, Navigation } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { fetchFamilyLocations, upsertLocation } from '@/services/locations';
import type { FamilyLocation, LocationStatus } from '@/types';

const statusIcon = (status: LocationStatus) => {
  switch (status) {
    case 'home':
      return <Home size={18} color="#16A34A" />;
    case 'work':
      return <Briefcase size={18} color="#2563EB" />;
    case 'school':
      return <School size={18} color="#F97316" />;
    default:
      return <Navigation size={18} color="#64748B" />;
  }
};

export function LocationsScreen() {
  const { family, profile, familyMembers } = useAuthStore();
  const [locations, setLocations] = useState<FamilyLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<LocationStatus>('away');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const locationSub = useRef<Location.LocationSubscription | null>(null);

  const loadLocations = async () => {
    if (!family?.id) return;
    setIsLoading(true);
    try {
      const data = await fetchFamilyLocations(family.id);
      setLocations(data);
    } catch (error) {
      Alert.alert('Failed to load', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [family?.id]);

  useEffect(() => {
    let isMounted = true;
    const startLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        return;
      }

      const applyLocationUpdate = (updated: FamilyLocation) => {
        setLocations((prev) => [updated, ...prev.filter((item) => item.id !== updated.id)]);
      };

      try {
        const initial = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!isMounted) return;
        const coords = {
          lat: initial.coords.latitude,
          lng: initial.coords.longitude,
        };
        setCurrentCoords(coords);
        if (family?.id && profile) {
          const updated = await upsertLocation({
            family_id: family.id,
            user_id: profile.id ?? profile.user_id ?? '',
            status: currentStatus,
            lat: coords.lat,
            lng: coords.lng,
          });
          applyLocationUpdate(updated);
        }
      } catch (error) {
        // Ignore initial location failures; watchPosition will retry.
      }

      locationSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 50,
          timeInterval: 60000,
        },
        async (position) => {
          if (!isMounted) return;
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentCoords(coords);
          if (family?.id && profile) {
            try {
              const updated = await upsertLocation({
                family_id: family.id,
                user_id: profile.id ?? profile.user_id ?? '',
                status: currentStatus,
                lat: coords.lat,
                lng: coords.lng,
              });
              applyLocationUpdate(updated);
            } catch (error) {
              // Avoid noisy alerts during background GPS updates.
            }
          }
        }
      );
    };

    startLocation().catch(() => {
      // Ignore permission errors; user can still set status.
    });

    return () => {
      isMounted = false;
      if (locationSub.current) {
        locationSub.current.remove();
        locationSub.current = null;
      }
    };
  }, [family?.id, profile?.id, profile?.user_id, currentStatus]);

  const handleStatusUpdate = async (status: LocationStatus) => {
    if (!family?.id || !profile) return;
    try {
      setIsLoading(true);
      setCurrentStatus(status);
      const updated = await upsertLocation({
        family_id: family.id,
        user_id: profile.id ?? profile.user_id ?? '',
        status,
        lat: currentCoords?.lat ?? null,
        lng: currentCoords?.lng ?? null,
      });
      setLocations((prev) => [updated, ...prev.filter((item) => item.id !== updated.id)]);
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const locationByUser = new Map(locations.map((item) => [item.user_id, item]));
  const markerLocations = useMemo(
    () => locations.filter((item) => typeof item.lat === 'number' && typeof item.lng === 'number'),
    [locations]
  );
  const initialRegion: Region = useMemo(() => {
    if (markerLocations.length > 0) {
      const first = markerLocations[0];
      return {
        latitude: first.lat as number,
        longitude: first.lng as number,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
    }
    return {
      latitude: 45.0,
      longitude: 15.0,
      latitudeDelta: 12,
      longitudeDelta: 12,
    };
  }, [markerLocations]);

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-6 pt-8 pb-6">
        <Text className="text-3xl font-bold text-slate-900">Family map</Text>
        <Text className="text-base text-slate-600 mt-1">Track where everyone is right now.</Text>
      </View>

      <View className="px-6">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900 mb-3">Live map</Text>
          <View className="rounded-2xl overflow-hidden h-64">
            <MapView
              style={{ flex: 1 }}
              initialRegion={initialRegion}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              showsUserLocation
              showsMyLocationButton={Platform.OS === 'android'}
            >
              {markerLocations.map((item) => (
                <Marker
                  key={item.id}
                  coordinate={{ latitude: item.lat as number, longitude: item.lng as number }}
                  title={familyMembers.find((member) => member.id === item.user_id)?.name ?? 'Member'}
                  description={item.status}
                />
              ))}
            </MapView>
          </View>
          {markerLocations.length === 0 && (
            <Text className="text-sm text-slate-500 mt-3">
              No GPS data yet. Status updates will appear here once lat/lng is provided.
            </Text>
          )}

          <Text className="text-lg font-semibold text-slate-900 mt-6">Update your status</Text>
          {currentCoords && (
            <Text className="text-xs text-slate-500 mt-2">
              GPS: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
            </Text>
          )}
          <View className="flex-row flex-wrap gap-3 mt-4">
            {(['home', 'work', 'school', 'away'] as LocationStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                className="bg-slate-50 rounded-2xl px-4 py-3 flex-row items-center"
                onPress={() => handleStatusUpdate(status)}
                disabled={isLoading}
              >
                {statusIcon(status)}
                <Text className="text-slate-700 font-medium ml-2 capitalize">{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View className="px-6 mt-6 pb-10">
        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <Text className="text-lg font-semibold text-slate-900">Live status</Text>
          {isLoading && <ActivityIndicator color="#7C3AED" className="mt-4" />}
          <View className="mt-4 gap-3">
            {familyMembers.map((member) => {
              const current = locationByUser.get(member.id);
              const status = current?.status ?? 'away';
              return (
                <View key={member.id} className="bg-slate-50 rounded-2xl px-4 py-3">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-slate-900 font-medium">{member.name}</Text>
                      <Text className="text-xs text-slate-500 mt-1 capitalize">{status}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={18} color="#7C3AED" />
                    </View>
                  </View>
                </View>
              );
            })}
            {familyMembers.length === 0 && (
              <Text className="text-sm text-slate-500">No members yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
