import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const colors = {
  primary: '#7c3aed',
  gray600: '#4b5563',
  gray800: '#1e293b',
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 10,
    marginBottom: 20,
  },
  logoSection: {
    width: 150,
  },
  logoImage: {
    maxWidth: 120,
    maxHeight: 60,
    objectFit: 'contain',
  },
  logoPlaceholder: {
    fontSize: 10,
    color: '#94a3b8',
  },
  clinicInfo: {
    textAlign: 'right' as const,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  clinicDetails: {
    fontSize: 9,
    color: colors.gray600,
    marginTop: 2,
  },
});

interface ReportHeaderProps {
  logoUrl?: string;
  clinicName: string;
  address?: string;
  reportDate: string;
}

export function ReportHeader({ logoUrl, clinicName, address, reportDate }: ReportHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoSection}>
        {logoUrl ? (
          <Image src={logoUrl} style={styles.logoImage} />
        ) : (
          <Text style={styles.logoPlaceholder}>[Logo da Clínica]</Text>
        )}
      </View>

      <View style={styles.clinicInfo}>
        <Text style={styles.clinicName}>{clinicName || 'Nome da Clínica'}</Text>
        {address ? (
          <Text style={styles.clinicDetails}>{address}</Text>
        ) : null}
        <Text style={styles.clinicDetails}>Período: {reportDate}</Text>
      </View>
    </View>
  );
}
