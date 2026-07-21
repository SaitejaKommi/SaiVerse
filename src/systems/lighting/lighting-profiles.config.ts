import type { DistrictLightingProfile, DistrictProfileId } from './lighting-profiles'

export const DISTRICT_LIGHTING_PROFILES: Record<DistrictProfileId, DistrictLightingProfile> = {
  hub: {
    id: 'hub',
    label: 'Bengaluru Hub',
    environment: 'city',
    environmentIntensity: 0.8,
    ambient: { color: '#404060', intensity: 0.3 },
    hemisphere: {
      skyColor: '#87ceeb',
      groundColor: '#1a1a2e',
      intensity: 0.6,
    },
    sun: {
      position: [80, 25, -30],
      intensity: 1.5,
      color: '#ffffff',
      shadowBias: -0.001,
      shadowNormalBias: 0.02,
    },
    fog: { color: '#020617', near: 30, far: 110 },
    reflectionIntensity: 0.8,
    shadowSoftness: 1.0,
  },

  campus: {
    id: 'campus',
    label: 'Campus',
    environment: 'park',
    environmentIntensity: 0.9,
    ambient: { color: '#4a3830', intensity: 0.35 },
    hemisphere: {
      skyColor: '#f5d4a8',
      groundColor: '#5a4a30',
      intensity: 0.7,
    },
    sun: {
      position: [40, 30, -20],
      intensity: 1.8,
      color: '#ffe4b5',
      shadowBias: -0.0008,
      shadowNormalBias: 0.015,
    },
    fog: { color: '#e8d5b0', near: 40, far: 120 },
    reflectionIntensity: 0.5,
    shadowSoftness: 2.0,
    supplemental: {
      pointLights: [
        { position: [0, 4, -140], color: '#ffd700', intensity: 0.8, distance: 12 },
        { position: [23, 3, -150], color: '#ffb866', intensity: 0.6, distance: 10 },
        { position: [-23, 3, -150], color: '#ffb866', intensity: 0.6, distance: 10 },
        { position: [0, 2, -115], color: '#ffe4b5', intensity: 0.5, distance: 8 },
      ],
    },
  },

  'software-city': {
    id: 'software-city',
    label: 'Software City',
    environment: 'city',
    environmentIntensity: 1.0,
    ambient: { color: '#406080', intensity: 0.25 },
    hemisphere: {
      skyColor: '#c8d8e8',
      groundColor: '#182830',
      intensity: 0.5,
    },
    sun: {
      position: [60, 35, -40],
      intensity: 2.0,
      color: '#e8f0ff',
      shadowBias: -0.001,
      shadowNormalBias: 0.02,
    },
    fog: { color: '#b0c8e0', near: 50, far: 140 },
    reflectionIntensity: 1.2,
    shadowSoftness: 1.0,
    supplemental: {
      pointLights: [
        { position: [0, 6, -250], color: '#00d4ff', intensity: 1.0, distance: 15 },
        { position: [28, 4, -240], color: '#00d4ff', intensity: 0.7, distance: 12 },
        { position: [-28, 4, -240], color: '#00ff88', intensity: 0.7, distance: 12 },
        { position: [28, 4, -260], color: '#00ff88', intensity: 0.6, distance: 10 },
        { position: [-28, 4, -260], color: '#00d4ff', intensity: 0.6, distance: 10 },
      ],
    },
  },

  'ai-district': {
    id: 'ai-district',
    label: 'AI District',
    environment: 'night',
    environmentIntensity: 0.7,
    ambient: { color: '#1a0a40', intensity: 0.2 },
    hemisphere: {
      skyColor: '#1a1a4a',
      groundColor: '#0a001a',
      intensity: 0.3,
    },
    sun: {
      position: [20, 10, -60],
      intensity: 0.8,
      color: '#8844ff',
      shadowBias: -0.002,
      shadowNormalBias: 0.025,
    },
    fog: { color: '#0a0a2a', near: 25, far: 90 },
    reflectionIntensity: 1.5,
    shadowSoftness: 0.5,
    supplemental: {
      pointLights: [
        { position: [0, 6, 0], color: '#aa44ff', intensity: 1.5, distance: 18 },
        { position: [30, 4, -30], color: '#00ffee', intensity: 1.0, distance: 14 },
        { position: [-30, 4, -30], color: '#ff44ff', intensity: 1.0, distance: 14 },
        { position: [30, 4, 30], color: '#ff44ff', intensity: 0.8, distance: 12 },
        { position: [-30, 4, 30], color: '#00ffee', intensity: 0.8, distance: 12 },
        { position: [0, 3, -60], color: '#8844ff', intensity: 0.6, distance: 10 },
      ],
    },
  },

  'open-source-valley': {
    id: 'open-source-valley',
    label: 'Open Source Valley',
    environment: 'sunset',
    environmentIntensity: 1.0,
    ambient: { color: '#5a4830', intensity: 0.4 },
    hemisphere: {
      skyColor: '#f0c8a0',
      groundColor: '#4a3a20',
      intensity: 0.8,
    },
    sun: {
      position: [-30, 25, -50],
      intensity: 1.6,
      color: '#ffb866',
      shadowBias: -0.0008,
      shadowNormalBias: 0.015,
    },
    fog: { color: '#d4b898', near: 35, far: 110 },
    reflectionIntensity: 0.6,
    shadowSoftness: 2.5,
    supplemental: {
      pointLights: [
        { position: [20, 3, 30], color: '#ff8844', intensity: 1.2, distance: 14 },
        { position: [-20, 3, 30], color: '#ff8844', intensity: 1.2, distance: 14 },
        { position: [0, 2, 0], color: '#ff6633', intensity: 1.0, distance: 12 },
        { position: [15, 2, 55], color: '#ffaa55', intensity: 0.7, distance: 10 },
        { position: [-15, 2, 55], color: '#ffaa55', intensity: 0.7, distance: 10 },
      ],
    },
  },

  'hackathon-arena': {
    id: 'hackathon-arena',
    label: 'Hackathon Arena',
    environment: 'studio',
    environmentIntensity: 0.6,
    ambient: { color: '#1a1020', intensity: 0.1 },
    hemisphere: {
      skyColor: '#2a1a3a',
      groundColor: '#0a0510',
      intensity: 0.2,
    },
    sun: {
      position: [10, 15, -20],
      intensity: 2.5,
      color: '#ff4488',
      shadowBias: -0.003,
      shadowNormalBias: 0.03,
    },
    fog: { color: '#0a0510', near: 15, far: 60 },
    reflectionIntensity: 1.8,
    shadowSoftness: 0.3,
    supplemental: {
      pointLights: [
        { position: [0, 8, 0], color: '#ff4488', intensity: 2.0, distance: 20 },
        { position: [25, 5, -25], color: '#44ff44', intensity: 1.5, distance: 16 },
        { position: [-25, 5, -25], color: '#ff44ff', intensity: 1.5, distance: 16 },
        { position: [25, 5, 25], color: '#ffaa00', intensity: 1.5, distance: 16 },
        { position: [-25, 5, 25], color: '#00ffff', intensity: 1.5, distance: 16 },
        { position: [0, 3, -40], color: '#ff0044', intensity: 1.0, distance: 12 },
      ],
    },
  },

  'career-district': {
    id: 'career-district',
    label: 'Career District',
    environment: 'lobby',
    environmentIntensity: 0.9,
    ambient: { color: '#e8e0d8', intensity: 0.3 },
    hemisphere: {
      skyColor: '#e8e8f0',
      groundColor: '#c0b8b0',
      intensity: 0.5,
    },
    sun: {
      position: [50, 30, 10],
      intensity: 1.4,
      color: '#fff8f0',
      shadowBias: -0.001,
      shadowNormalBias: 0.02,
    },
    fog: { color: '#e0d8d0', near: 40, far: 120 },
    reflectionIntensity: 1.0,
    shadowSoftness: 1.5,
    supplemental: {
      pointLights: [
        { position: [0, 5, 0], color: '#ffd700', intensity: 1.0, distance: 14 },
        { position: [30, 4, -20], color: '#fff8f0', intensity: 0.8, distance: 12 },
        { position: [-30, 4, -20], color: '#ffd700', intensity: 0.8, distance: 12 },
        { position: [30, 4, 20], color: '#ffd700', intensity: 0.6, distance: 10 },
        { position: [-30, 4, 20], color: '#fff8f0', intensity: 0.6, distance: 10 },
      ],
    },
  },

  'final-summit': {
    id: 'final-summit',
    label: 'Final Summit',
    environment: 'sunset',
    environmentIntensity: 1.2,
    ambient: { color: '#6a4030', intensity: 0.3 },
    hemisphere: {
      skyColor: '#f0a070',
      groundColor: '#3a2010',
      intensity: 0.6,
    },
    sun: {
      position: [-60, 10, -80],
      intensity: 2.2,
      color: '#ff8844',
      shadowBias: -0.0005,
      shadowNormalBias: 0.01,
    },
    fog: { color: '#d49060', near: 60, far: 160 },
    reflectionIntensity: 0.4,
    shadowSoftness: 3.0,
    supplemental: {
      pointLights: [
        { position: [0, 10, 0], color: '#ffaa44', intensity: 2.0, distance: 24 },
        { position: [20, 6, -20], color: '#ffcc66', intensity: 1.2, distance: 16 },
        { position: [-20, 6, -20], color: '#ffcc66', intensity: 1.2, distance: 16 },
        { position: [20, 6, 20], color: '#ffdd88', intensity: 1.0, distance: 14 },
        { position: [-20, 6, 20], color: '#ffdd88', intensity: 1.0, distance: 14 },
        { position: [0, 4, -40], color: '#ff8844', intensity: 0.8, distance: 12 },
      ],
    },
  },
}

export const DEFAULT_PROFILE: DistrictProfileId = 'hub'
