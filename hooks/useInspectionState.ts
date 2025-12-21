import { useState, useCallback } from 'react';
import { InspectionState, Vehicle, InspectionChecklistItem, InspectionSection, InspectionPhoto, InspectionAudio } from '../types';
import { VEHICLE_INSPECTION_TEMPLATES } from '../constants';

export type VehicleType = keyof typeof VEHICLE_INSPECTION_TEMPLATES;

const createInitialChecklist = (vehicleType: VehicleType): InspectionSection => {
  const template = VEHICLE_INSPECTION_TEMPLATES[vehicleType];
  const checklist: InspectionSection = {};
  for (const category in template) {
    const items = template[category as keyof typeof template] as string[];
    if (Array.isArray(items)) {
      checklist[category] = items.map((item: string): InspectionChecklistItem => ({
      item,
      checked: false,
      notes: '',
      photos: [],
      audio: null,
    }));
    }
  }
  return checklist;
};

export const useInspectionState = () => {
  const [state, setState] = useState<InspectionState | null>(null);

  const initializeState = useCallback((vehicle: Vehicle, vehicleType: VehicleType) => {
    setState({
      vehicle,
      vehicleType,
      checklist: createInitialChecklist(vehicleType),
      overallNotes: '',
      odometer: '',
    });
  }, []);

  const updateChecklistItem = useCallback((category: string, itemIndex: number, updates: Partial<InspectionChecklistItem>) => {
    setState(prevState => {
      if (!prevState) return null;
      const newChecklist = { ...prevState.checklist };
      const newItems = [...newChecklist[category]];
      newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
      newChecklist[category] = newItems;
      return { ...prevState, checklist: newChecklist };
    });
  }, []);

  const setOdometer = useCallback((value: string) => {
    setState(prevState => prevState ? { ...prevState, odometer: value } : null);
  }, []);
  
  const setOverallNotes = useCallback((value: string) => {
    setState(prevState => prevState ? { ...prevState, overallNotes: value } : null);
  }, []);

  const addPhotoToChecklistItem = useCallback((category: string, itemIndex: number, photo: InspectionPhoto) => {
    setState(prevState => {
        if (!prevState) return null;
        const newChecklist = { ...prevState.checklist };
        const newItems = [...newChecklist[category]];
        const currentItem = { ...newItems[itemIndex] };
        currentItem.photos = [...currentItem.photos, photo];
        newItems[itemIndex] = currentItem;
        newChecklist[category] = newItems;
        return { ...prevState, checklist: newChecklist };
    });
  }, []);

  const removePhotoFromChecklistItem = useCallback((category: string, itemIndex: number, photoId: string) => {
    setState(prevState => {
        if (!prevState) return null;
        const newChecklist = { ...prevState.checklist };
        const newItems = [...newChecklist[category]];
        const currentItem = { ...newItems[itemIndex] };
        currentItem.photos = currentItem.photos.filter(p => p.id !== photoId);
        newItems[itemIndex] = currentItem;
        newChecklist[category] = newItems;
        return { ...prevState, checklist: newChecklist };
    });
  }, []);

  const addAudioToChecklistItem = useCallback((category: string, itemIndex: number, audio: InspectionAudio) => {
    setState(prevState => {
        if (!prevState) return null;
        const newChecklist = { ...prevState.checklist };
        const newItems = [...newChecklist[category]];
        const currentItem = { ...newItems[itemIndex] };
        currentItem.audio = audio;
        newItems[itemIndex] = currentItem;
        newChecklist[category] = newItems;
        return { ...prevState, checklist: newChecklist };
    });
  }, []);

  return {
    inspectionState: state,
    initializeState,
    updateChecklistItem,
    setOdometer,
    setOverallNotes,
    addPhotoToChecklistItem,
    removePhotoFromChecklistItem,
    addAudioToChecklistItem,
  };
};
