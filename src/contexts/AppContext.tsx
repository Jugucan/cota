import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Space, Measurement, Box3D, User } from '@/types';

// Simple UUID generator
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface AppContextType {
  user: User | null;
  spaces: Space[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  createSpace: (name: string, icon: string) => void;
  updateSpace: (spaceId: string, updates: Partial<Space>) => void;
  deleteSpace: (spaceId: string) => void;
  addMeasurement: (spaceId: string, measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMeasurement: (spaceId: string, measurementId: string, updates: Partial<Measurement>) => void;
  deleteMeasurement: (spaceId: string, measurementId: string) => void;
  addBox: (spaceId: string, measurementId: string, box: Omit<Box3D, 'id'>) => void;
  updateBox: (spaceId: string, measurementId: string, boxId: string, updates: Partial<Box3D>) => void;
  deleteBox: (spaceId: string, measurementId: string, boxId: string) => void;
  getSpace: (spaceId: string) => Space | undefined;
  getMeasurement: (spaceId: string, measurementId: string) => Measurement | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Demo data for preview
const createDemoData = (): Space[] => [
  {
    id: generateId(),
    name: 'Kitchen',
    icon: '🍳',
    measurements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: generateId(),
    name: 'Bedroom',
    icon: '🛏️',
    measurements: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({
    id: 'demo-user',
    email: 'demo@example.com',
    displayName: 'Demo User',
  });
  const [spaces, setSpaces] = useState<Space[]>(createDemoData());
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate login - replace with Firebase
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: generateId(),
      email,
      displayName: email.split('@')[0],
    });
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: generateId(),
      email: 'google@example.com',
      displayName: 'Google User',
    });
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: generateId(),
      email,
      displayName,
    });
    setSpaces(createDemoData());
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setSpaces([]);
  };

  const createSpace = useCallback((name: string, icon: string) => {
    const newSpace: Space = {
      id: generateId(),
      name,
      icon,
      measurements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSpaces(prev => [...prev, newSpace]);
  }, []);

  const updateSpace = useCallback((spaceId: string, updates: Partial<Space>) => {
    setSpaces(prev =>
      prev.map(space =>
        space.id === spaceId
          ? { ...space, ...updates, updatedAt: new Date() }
          : space
      )
    );
  }, []);

  const deleteSpace = useCallback((spaceId: string) => {
    setSpaces(prev => prev.filter(space => space.id !== spaceId));
  }, []);

  const addMeasurement = useCallback(
    (spaceId: string, measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newMeasurement: Measurement = {
        ...measurement,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSpaces(prev =>
        prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: [...space.measurements, newMeasurement],
                updatedAt: new Date(),
              }
            : space
        )
      );
    },
    []
  );

  const updateMeasurement = useCallback(
    (spaceId: string, measurementId: string, updates: Partial<Measurement>) => {
      setSpaces(prev =>
        prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: space.measurements.map(m =>
                  m.id === measurementId
                    ? { ...m, ...updates, updatedAt: new Date() }
                    : m
                ),
                updatedAt: new Date(),
              }
            : space
        )
      );
    },
    []
  );

  const deleteMeasurement = useCallback((spaceId: string, measurementId: string) => {
    setSpaces(prev =>
      prev.map(space =>
        space.id === spaceId
          ? {
              ...space,
              measurements: space.measurements.filter(m => m.id !== measurementId),
              updatedAt: new Date(),
            }
          : space
      )
    );
  }, []);

  const addBox = useCallback(
    (spaceId: string, measurementId: string, box: Omit<Box3D, 'id'>) => {
      const newBox: Box3D = { ...box, id: generateId() };
      setSpaces(prev =>
        prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: space.measurements.map(m =>
                  m.id === measurementId
                    ? { ...m, boxes: [...m.boxes, newBox], updatedAt: new Date() }
                    : m
                ),
                updatedAt: new Date(),
              }
            : space
        )
      );
    },
    []
  );

  const updateBox = useCallback(
    (spaceId: string, measurementId: string, boxId: string, updates: Partial<Box3D>) => {
      setSpaces(prev =>
        prev.map(space =>
          space.id === spaceId
            ? {
                ...space,
                measurements: space.measurements.map(m =>
                  m.id === measurementId
                    ? {
                        ...m,
                        boxes: m.boxes.map(b =>
                          b.id === boxId ? { ...b, ...updates } : b
                        ),
                        updatedAt: new Date(),
                      }
                    : m
                ),
                updatedAt: new Date(),
              }
            : space
        )
      );
    },
    []
  );

  const deleteBox = useCallback((spaceId: string, measurementId: string, boxId: string) => {
    setSpaces(prev =>
      prev.map(space =>
        space.id === spaceId
          ? {
              ...space,
              measurements: space.measurements.map(m =>
                m.id === measurementId
                  ? { ...m, boxes: m.boxes.filter(b => b.id !== boxId), updatedAt: new Date() }
                  : m
              ),
              updatedAt: new Date(),
            }
          : space
      )
    );
  }, []);

  const getSpace = useCallback((spaceId: string) => {
    return spaces.find(s => s.id === spaceId);
  }, [spaces]);

  const getMeasurement = useCallback((spaceId: string, measurementId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    return space?.measurements.find(m => m.id === measurementId);
  }, [spaces]);

  return (
    <AppContext.Provider
      value={{
        user,
        spaces,
        isLoading,
        isAuthenticated,
        login,
        loginWithGoogle,
        signup,
        logout,
        createSpace,
        updateSpace,
        deleteSpace,
        addMeasurement,
        updateMeasurement,
        deleteMeasurement,
        addBox,
        updateBox,
        deleteBox,
        getSpace,
        getMeasurement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
