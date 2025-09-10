import React, { createContext, useContext, useReducer } from 'react';

// État initial de l'application
const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  cache: new Map(),
  settings: {
    theme: 'light',
    language: 'fr',
    notifications: true
  }
};

// Actions disponibles
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PROJECTS: 'SET_PROJECTS',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_CACHE: 'SET_CACHE',
  CLEAR_CACHE: 'CLEAR_CACHE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Reducer pour gérer l'état
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.SET_PROJECTS:
      return { ...state, projects: action.payload, loading: false };
    
    case actionTypes.SET_CURRENT_PROJECT:
      return { ...state, currentProject: action.payload };
    
    case actionTypes.ADD_PROJECT:
      return { 
        ...state, 
        projects: [...state.projects, action.payload],
        loading: false 
      };
    
    case actionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject
      };
    
    case actionTypes.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload 
          ? null 
          : state.currentProject
      };
    
    case actionTypes.SET_CACHE:
      const newCache = new Map(state.cache);
      newCache.set(action.payload.key, action.payload.value);
      return { ...state, cache: newCache };
    
    case actionTypes.CLEAR_CACHE:
      return { ...state, cache: new Map() };
    
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    default:
      return state;
  }
}

// Contexte
const AppContext = createContext();

// Hook pour utiliser le contexte
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    setProjects: (projects) => dispatch({ type: actionTypes.SET_PROJECTS, payload: projects }),
    
    setCurrentProject: (project) => dispatch({ type: actionTypes.SET_CURRENT_PROJECT, payload: project }),
    
    addProject: (project) => dispatch({ type: actionTypes.ADD_PROJECT, payload: project }),
    
    updateProject: (project) => dispatch({ type: actionTypes.UPDATE_PROJECT, payload: project }),
    
    deleteProject: (projectId) => dispatch({ type: actionTypes.DELETE_PROJECT, payload: projectId }),
    
    setCache: (key, value) => dispatch({ 
      type: actionTypes.SET_CACHE, 
      payload: { key, value } 
    }),
    
    getCache: (key) => state.cache.get(key),
    
    clearCache: () => dispatch({ type: actionTypes.CLEAR_CACHE }),
    
    updateSettings: (settings) => dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: settings })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}