import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viajero Conectado</Text>
      <Text style={styles.subtitle}>Red social + marketplace de viajes</Text>
      <Text style={styles.description}>
        Descubre, conecta y viaja con quienes ya estuvieron allí
      </Text>

      <View style={styles.buttons}>
        <Link href="/explore" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Explorar destinos</Text>
          </Pressable>
        </Link>

        <Link href="/auth/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Iniciar sesión</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttons: {
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
