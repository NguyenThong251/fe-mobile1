// components/SafeScreen.tsx
import React from 'react'
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import COLORS from '../constants/colors';
interface SafeScreenProps {
  children: ReactNode;
}

export default function SafeScreen({ children }: SafeScreenProps) {
  const insets = useSafeAreaInsets(); 
  return (
    <View
    //   className="flex-1 bg-background"
    style={[{
       
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      },styles.container]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: COLORS.background,
    
  }
});