import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Home, Briefcase, School, Navigation } from 'lucide-react-native';
import { useAuthStore } from '@/store';
import { fetchFamilyLocations, upsertLocation } from '@/services/locations';
import type { FamilyLocation, LocationStatus } from '@/types';
import { useTheme } from '@/theme';

const statusIcon = (status: LocationStatus, theme: any) => {
  switch (status) {
    case 'home':
      return <Home size={18} color={theme.colors.success} />;
    case 'work':
      return <Briefcase size={18} color={theme.colors.primary} />;
    case 'school':
      return <School size={18} color={theme.colors.warning} />;
    default:
      return <Navigation size={18} color={theme.colors.textSecondary} />;
  }
};

export function LocationsScreen() {
  const { family, profile, familyMembers } = useAuthStore();
  const { theme } = useTheme();
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
            user_id: profile.user_id ?? '', // KORISTI SAMO user_id
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
                user_id: profile.user_id ?? '', // KORISTI SAMO user_id
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
        user_id: profile.user_id ?? '', // KORISTI SAMO user_id
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Dekorativni krugovi */}
        <View style={{ position: 'absolute', top: 50, right: -10, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, opacity: 0.4 }} />
        <View style={{ position: 'absolute', top: 130, left: 20, width: 35, height: 35, borderRadius: 18, backgroundColor: theme.colors.primary, opacity: 0.4 }} />

        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '700' }}>Family Map 📍</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 16, marginTop: 8 }}>Track where everyone is right now.</Text>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Live map</Text>
            <View style={{ borderRadius: 16, overflow: 'hidden', height: 220 }}>
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
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13, marginTop: 12 }}>
                No GPS data yet. Status updates will appear here once lat/lng is provided.
              </Text>
            )}

            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginTop: 24 }}>Update your status</Text>
            {currentCoords && (
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                GPS: {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
              </Text>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
              {(['home', 'work', 'school', 'away'] as LocationStatus[]).map((status) => {
                const isActive = currentStatus === status;
                const colors: Record<LocationStatus, string> = {
                  home: theme.colors.success,
                  work: theme.colors.primary,
                  school: theme.colors.warning,
                  away: theme.colors.textMuted
                };
                return (
                  <TouchableOpacity
                    key={status}
                    style={{
                      backgroundColor: isActive ? colors[status] : theme.colors.background,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: isActive ? colors[status] : theme.colors.border,
                    }}
                    onPress={() => handleStatusUpdate(status)}
                    disabled={isLoading}
                  >
                    {statusIcon(status, theme)}
                    <Text style={{ 
                      color: isActive ? theme.colors.background : theme.colors.textSecondary, 
                      fontWeight: '600', 
                      marginLeft: 8, 
                      textTransform: 'capitalize' 
                    }}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 24, 
            padding: 20,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>Live status</Text>
            {isLoading && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />}
            <View style={{ marginTop: 16, gap: 12 }}>
              {familyMembers.map((member, index) => {
                const current = locationByUser.get(member.id);
                const status = current?.status ?? 'away';
                const bgColor = theme.colors.cardSecondary;
                return (
                  <View 
                    key={member.id} 
                    style={{
                      backgroundColor: bgColor,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Text style={{ fontSize: 20 }}>👤</Text>
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>{member.name}</Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2, textTransform: 'capitalize' }}>{status}</Text>
                      </View>
                    </View>
                    <MapPin size={20} color={theme.colors.primary} />
                  </View>
                );
              })}
              {familyMembers.length === 0 && (
                <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>No members yet.</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
