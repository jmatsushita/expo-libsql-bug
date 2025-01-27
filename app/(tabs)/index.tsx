import { Image, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { IOS_DOCUMENT_PATH, IOS_LIBRARY_PATH, open } from '@op-engineering/op-sqlite';
import { Directory, File, Paths } from 'expo-file-system/next';
import { Stack } from 'expo-router';
import React, { Suspense, useEffect, useMemo, useState, useRef } from 'react';
import { InteractionManager, Platform, Text, View } from 'react-native';

// Database initialization code outside component
let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  // Ensure we're on the main thread
  await InteractionManager.runAfterInteractions();

  const dbDirectory = Platform.OS === 'ios'
    ? new Directory(Object.values(Paths.appleSharedContainers)?.[0] || Paths.document.uri)
    : Paths.document;

  console.log('OPSQLite IOS_LIBRARY_PATH:', IOS_LIBRARY_PATH);
  console.log('OPSQLite IOS_DOCUMENT_PATH:', IOS_DOCUMENT_PATH);
  console.log('Using location:', dbDirectory.uri);

  dbInstance = open({
    name: 'inMemoryDb',
    location: ':memory:',
  });

  return dbInstance;
}

export default function OpSqlite() {
  const [res, setRes] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const db = await getDb();
        const result = await db.execute('SELECT 1 AS value');

        if (mounted && result?.rows?.[0]) {
          setRes(result.rows[0].value?.toString() || '');
          // db.sync();
        }
      } catch (error) {
        console.error('Error in database initialization:', error);
        if (mounted) setRes('Error');
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedText type="defaultSemiBold">SQLite Test Result: {res}</ThemedText>
      </ParallaxScrollView >
    </>
  );
}


const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
