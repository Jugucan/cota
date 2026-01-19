import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Space, Measurement, Box3D, User } from '@/types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // Carregar spaces de Firestore
  const loadSpaces = useCallback(async (userId: string) => {
    try {
      const spacesRef = collection(db, 'users', userId, 'spaces');
      const q = query(spacesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const loadedSpaces: Space[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          icon: data.icon,
          measurements: data.measurements || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      
      setSpaces(loadedSpaces);
    } catch (error) {
      console.error('Error carregant espais:', error);
      setSpaces([]);
    }
  }, []);

  // Escoltar canvis d'autenticació
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuari',
          photoUrl: firebaseUser.photoURL || undefined,
        };
        setUser(appUser);
        await loadSpaces(firebaseUser.uid);
      } else {
        setUser(null);
        setSpaces([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [loadSpaces]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error login:', error);
      throw new Error(error.message || 'Error al iniciar sessió');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Error Google login:', error);
      throw new Error(error.message || 'Error al iniciar sessió amb Google');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualitzar el perfil amb el nom
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Recarregar l'usuari per obtenir el displayName actualitzat
      await userCredential.user.reload();
    } catch (error: any) {
      console.error('Error signup:', error);
      throw new Error(error.message || 'Error al crear el compte');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logout:', error);
    }
  };

  const createSpace = useCallback(async (name: string, icon: string) => {
    if (!user) return;
    
    try {
      const newSpace = {
        name,
        icon,
        measurements: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const spacesRef = collection(db, 'users', user.id, 'spaces');
      const docRef = await addDoc(spacesRef, newSpace);
      
      // Afegir a l'estat local
      setSpaces(prev => [{
        id: docRef.id,
        ...newSpace,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, ...prev]);
    } catch (error) {
      console.error('Error creant espai:', error);
    }
  }, [user]);

  const updateSpace = useCallback(async (spaceId: string, updates: Partial<Space>) => {
    if (!user) return;
    
    try {
      const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
      await updateDoc(spaceRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      
      // Actualitzar estat local
      setSpaces(prev =>
        prev.map(space =>
          space.id === spaceId
            ? { ...space, ...updates, updatedAt: new Date() }
            : space
        )
      );
    } catch (error) {
      console.error('Error actualitzant espai:', error);
    }
  }, [user]);

  const deleteSpace = useCallback(async (spaceId: string) => {
    if (!user) return;
    
    try {
      const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
      await deleteDoc(spaceRef);
      
      // Actualitzar estat local
      setSpaces(prev => prev.filter(space => space.id !== spaceId));
    } catch (error) {
      console.error('Error esborrant espai:', error);
    }
  }, [user]);

  const addMeasurement = useCallback(
    async (spaceId: string, measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return;
      
      try {
        const space = spaces.find(s => s.id === spaceId);
        if (!space) return;
        
        const newMeasurement: Measurement = {
          ...measurement,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        const updatedMeasurements = [...space.measurements, newMeasurement];
        
        const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
        await updateDoc(spaceRef, {
          measurements: updatedMeasurements,
          updatedAt: Timestamp.now(),
        });
        
        // Actualitzar estat local
        setSpaces(prev =>
          prev.map(s =>
            s.id === spaceId
              ? { ...s, measurements: updatedMeasurements, updatedAt: new Date() }
              : s
          )
        );
      } catch (error) {
        console.error('Error afegint mesura:', error);
      }
    },
    [user, spaces]
  );

  const updateMeasurement = useCallback(
    async (spaceId: string, measurementId: string, updates: Partial<Measurement>) => {
      if (!user) return;
      
      try {
        const space = spaces.find(s => s.id === spaceId);
        if (!space) return;
        
        const updatedMeasurements = space.measurements.map(m =>
          m.id === measurementId
            ? { ...m, ...updates, updatedAt: new Date() }
            : m
        );
        
        const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
        await updateDoc(spaceRef, {
          measurements: updatedMeasurements,
          updatedAt: Timestamp.now(),
        });
        
        // Actualitzar estat local
        setSpaces(prev =>
          prev.map(s =>
            s.id === spaceId
              ? { ...s, measurements: updatedMeasurements, updatedAt: new Date() }
              : s
          )
        );
      } catch (error) {
        console.error('Error actualitzant mesura:', error);
      }
    },
    [user, spaces]
  );

  const deleteMeasurement = useCallback(
    async (spaceId: string, measurementId: string) => {
      if (!user) return;
      
      try {
        const space = spaces.find(s => s.id === spaceId);
        if (!space) return;
        
        const updatedMeasurements = space.measurements.filter(m => m.id !== measurementId);
        
        const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
        await updateDoc(spaceRef, {
          measurements: updatedMeasurements,
          updatedAt: Timestamp.now(),
        });
        
        // Actualitzar estat local
        setSpaces(prev =>
          prev.map(s =>
            s.id === spaceId
              ? { ...s, measurements: updatedMeasurements, updatedAt: new Date() }
              : s
          )
        );
      } catch (error) {
        console.error('Error esborrant mesura:', error);
      }
    },
    [user, spaces]
  );

  const addBox = useCallback(
    async (spaceId: string, measurementId: string, box: Omit<Box3D, 'id'>) => {
      if (!user) return;
      
      try {
        const space = spaces.find(s => s.id === spaceId);
        if (!space) return;
        
        const updatedMeasurements = space.measurements.map(m => {
          if (m.id === measurementId) {
            const newBox: Box3D = { ...box, id: generateId() };
            return { ...m, boxes: [...m.boxes, newBox], updatedAt: new Date() };
          }
          return m;
        });
        
        const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
        await updateDoc(spaceRef, {
          measurements: updatedMeasurements,
          updatedAt: Timestamp.now(),
        });
        
        // Actualitzar estat local
        setSpaces(prev =>
          prev.map(s =>
            s.id === spaceId
              ? { ...s, measurements: updatedMeasurements, updatedAt: new Date() }
              : s
          )
        );
      } catch (error) {
        console.error('Error afegint caixa:', error);
      }
    },
    [user, spaces]
  );

  const updateBox = useCallback(
    async (spaceId: string, measurementId: string, boxId: string, updates: Partial<Box3D>) => {
      if (!user) return;
      
      try {
        const space = spaces.find(s => s.id === spaceId);
        if (!space) return;
        
        const updatedMeasurements = space.measurements.map(m => {
          if (m.id === measurementId) {
            return {
              ...m,
              boxes: m.boxes.map(b =>
                b.id === boxId ? { ...b, ...updates } : b
              ),
              updatedAt: new Date(),
            };
          }
          return m;
        });
        
        const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
        await updateDoc(spaceRef, {
          measurements: updatedMeasurements,
          updatedAt: Timestamp.now(),
        });
        
        // Actualitzar estat local
        setSpaces(prev =>
          prev.map(s =>
            s.id === spaceId
              ? { ...s, measurements: updatedMeasurements, updatedAt: new Date() }
              : s
          )
        );
      } catch (error) {
        console.error('Error actualitzant caixa:', error);
      }
    },
    [user, spaces]
  );

  const deleteBox = useCallback(
    async (spaceId: string, measurementId: string, boxId: string) => {
      if (!user) return;
      
      try {
        const space = spaces.find(s => s.id === spaceId);
        if (!space) return;
        
        const updatedMeasurements = space.measurements.map(m => {
          if (m.id === measurementId) {
            return {
              ...m,
              boxes: m.boxes.filter(b => b.id !== boxId),
              updatedAt: new Date(),
            };
          }
          return m;
        });
        
        const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
        await updateDoc(spaceRef, {
          measurements: updatedMeasurements,
          updatedAt: Timestamp.now(),
        });
        
        // Actualitzar estat local
        setSpaces(prev =>
          prev.map(s =>
            s.id === spaceId
              ? { ...s, measurements: updatedMeasurements, updatedAt: new Date() }
              : s
          )
        );
      } catch (error) {
        console.error('Error esborrant caixa:', error);
      }
    },
    [user, spaces]
  );

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
