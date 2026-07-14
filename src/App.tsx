/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { 
  Dumbbell, 
  Flame, 
  Utensils, 
  Calendar, 
  User, 
  Bell, 
  Check, 
  Plus, 
  Upload, 
  Clock, 
  Award, 
  X, 
  Sparkles, 
  Droplet, 
  TrendingUp, 
  Trash2, 
  Edit3, 
  Activity, 
  CheckCircle2, 
  RotateCcw,
  Apple,
  TrendingDown,
  Heart,
  Smile,
  PartyPopper,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces for our state model
interface Meal {
  id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  description: string;
  completed: boolean;
  photoUrl: string | null;
  emoji: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  completed: boolean;
}

interface Routine {
  id: string;
  name: string;
  estimatedTime: string;
  active: boolean;
  exercises: Exercise[];
}

interface HistoryLog {
  id: string;
  type: 'workout' | 'diet' | 'water' | 'streak';
  title: string;
  description: string;
  timestamp: string;
  calories?: number;
  caloriesBurned?: number;
}

const DEFAULT_ROUTINES_BY_DAY: Record<string, Routine[]> = {
  Monday: [
    {
      id: 'chest-triceps',
      name: 'Chest & Triceps',
      estimatedTime: '60 Min',
      active: true,
      exercises: [
        { id: 'm1-1', name: 'Bench Press', sets: '4', reps: '10', completed: false },
        { id: 'm1-2', name: 'Incline Bench Press', sets: '3', reps: '12', completed: false },
        { id: 'm1-3', name: 'Dumbbell Fly', sets: '3', reps: '15', completed: false },
        { id: 'm1-4', name: 'Push-Ups', sets: '3', reps: 'Failure', completed: false },
        { id: 'm1-5', name: 'Tricep Dips', sets: '3', reps: '12', completed: false },
        { id: 'm1-6', name: 'Rope Pushdown', sets: '4', reps: '15', completed: false },
      ]
    }
  ],
  Tuesday: [
    {
      id: 'back-biceps',
      name: 'Back & Biceps',
      estimatedTime: '55 Min',
      active: true,
      exercises: [
        { id: 't2-1', name: 'Deadlift', sets: '4', reps: '8', completed: false },
        { id: 't2-2', name: 'Bent Over Row', sets: '3', reps: '10', completed: false },
        { id: 't2-3', name: 'Lat Pulldown', sets: '3', reps: '12', completed: false },
        { id: 't2-4', name: 'Seated Cable Row', sets: '3', reps: '12', completed: false },
        { id: 't2-5', name: 'Barbell Curl', sets: '4', reps: '10', completed: false },
        { id: 't2-6', name: 'Hammer Curl', sets: '3', reps: '12', completed: false },
      ]
    }
  ],
  Wednesday: [
    {
      id: 'leg-day',
      name: 'Leg Day',
      estimatedTime: '65 Min',
      active: true,
      exercises: [
        { id: 'w3-1', name: 'Squat', sets: '4', reps: '10', completed: false },
        { id: 'w3-2', name: 'Leg Press', sets: '3', reps: '12', completed: false },
        { id: 'w3-3', name: 'Leg Curl', sets: '3', reps: '15', completed: false },
        { id: 'w3-4', name: 'Leg Extension', sets: '3', reps: '15', completed: false },
        { id: 'w3-5', name: 'Walking Lunges', sets: '3', reps: '20 steps', completed: false },
        { id: 'w3-6', name: 'Standing Calf Raises', sets: '4', reps: '20', completed: false },
      ]
    }
  ],
  Thursday: [
    {
      id: 'shoulders-abs',
      name: 'Shoulders & Abs',
      estimatedTime: '60 Min',
      active: true,
      exercises: [
        { id: 'th4-1', name: 'Shoulder Press', sets: '4', reps: '10', completed: false },
        { id: 'th4-2', name: 'Lateral Raise', sets: '4', reps: '15', completed: false },
        { id: 'th4-3', name: 'Front Raise', sets: '3', reps: '12', completed: false },
        { id: 'th4-4', name: 'Rear Delt Fly', sets: '3', reps: '15', completed: false },
        { id: 'th4-5', name: 'Plank', sets: '3', reps: '60s', completed: false },
        { id: 'th4-6', name: 'Crunches', sets: '3', reps: '25', completed: false },
        { id: 'th4-7', name: 'Hanging Leg Raise', sets: '3', reps: '15', completed: false },
      ]
    }
  ],
  Friday: [
    {
      id: 'arms',
      name: 'Arms',
      estimatedTime: '50 Min',
      active: true,
      exercises: [
        { id: 'f5-1', name: 'Barbell Curl', sets: '4', reps: '10', completed: false },
        { id: 'f5-2', name: 'Dumbbell Curl', sets: '3', reps: '12', completed: false },
        { id: 'f5-3', name: 'Hammer Curl', sets: '3', reps: '12', completed: false },
        { id: 'f5-4', name: 'Tricep Pushdown', sets: '4', reps: '15', completed: false },
        { id: 'f5-5', name: 'Overhead Tricep Extension', sets: '3', reps: '12', completed: false },
        { id: 'f5-6', name: 'Wrist Curl', sets: '3', reps: '15', completed: false },
      ]
    }
  ],
  Saturday: [
    {
      id: 'full-body',
      name: 'Full Body',
      estimatedTime: '70 Min',
      active: true,
      exercises: [
        { id: 's6-1', name: 'Squat', sets: '3', reps: '10', completed: false },
        { id: 's6-2', name: 'Bench Press', sets: '3', reps: '10', completed: false },
        { id: 's6-3', name: 'Deadlift', sets: '3', reps: '8', completed: false },
        { id: 's6-4', name: 'Pull-Ups', sets: '3', reps: 'Failure', completed: false },
        { id: 's6-5', name: 'Shoulder Press', sets: '3', reps: '10', completed: false },
        { id: 's6-6', name: 'Plank', sets: '3', reps: '60s', completed: false },
      ]
    }
  ],
  Sunday: [
    {
      id: 'recovery-day',
      name: 'Recovery Day',
      estimatedTime: '35 Min',
      active: true,
      exercises: [
        { id: 'su7-1', name: 'Stretching', sets: '1', reps: '10 Min', completed: false },
        { id: 'su7-2', name: 'Yoga', sets: '1', reps: '15 Min', completed: false },
        { id: 'su7-3', name: 'Foam Rolling', sets: '1', reps: '5 Min', completed: false },
        { id: 'su7-4', name: 'Walking', sets: '1', reps: '20 Min', completed: false },
        { id: 'su7-5', name: 'Deep Breathing', sets: '1', reps: '5 Min', completed: false },
      ]
    }
  ]
};

// Premium Food Posters Mapping
const DAY_POSTERS: Record<string, string> = {
  Monday: '/src/assets/images/monday_chest_triceps_1784032816703.jpg',
  Tuesday: '/src/assets/images/tuesday_back_biceps_1784032835806.jpg',
  Wednesday: '/src/assets/images/wednesday_leg_day_1784032848798.jpg',
  Thursday: '/src/assets/images/thursday_shoulders_abs_1784032861894.jpg',
  Friday: '/src/assets/images/friday_arms_1784032873372.jpg',
  Saturday: '/src/assets/images/saturday_full_body_1784032884047.jpg',
  Sunday: '/src/assets/images/sunday_recovery_day_1784032897057.jpg'
};

const DAY_WORKOUT_NAMES: Record<string, string> = {
  Monday: 'Chest & Triceps',
  Tuesday: 'Back & Biceps',
  Wednesday: 'Leg Day',
  Thursday: 'Shoulders & Abs',
  Friday: 'Arms',
  Saturday: 'Full Body',
  Sunday: 'Recovery Day'
};

const DAY_WORKOUT_POSTERS: Record<string, string> = {
  Monday: '/src/assets/images/workout_monday_1784033399904.jpg',
  Tuesday: '/src/assets/images/workout_tuesday_1784033418849.jpg',
  Wednesday: '/src/assets/images/workout_wednesday_1784033435867.jpg',
  Thursday: '/src/assets/images/workout_thursday_1784033449755.jpg',
  Friday: '/src/assets/images/workout_friday_1784033463494.jpg',
  Saturday: '/src/assets/images/workout_saturday_1784033478050.jpg',
  Sunday: '/src/assets/images/workout_sunday_1784033492719.jpg'
};

const PIXAR_GIRL_THUMBSUP = '/src/assets/images/pixar_girl_thumbsup_1784034638644.jpg';
const PIXAR_GIRL_DANCING = '/src/assets/images/pixar_girl_dancing_1784034650617.jpg';

interface WorkoutPosterMeta {
  themeColor: string;
  themeClass: string;
  icon: string;
  quote: string;
  exercises: string[];
  action: string;
  background: string;
}

const WORKOUT_METADATA: Record<string, WorkoutPosterMeta> = {
  Monday: {
    themeColor: 'from-red-600/95 to-red-950/95',
    themeClass: 'red',
    icon: '💪 Chest Muscle Icon',
    quote: 'Push Yourself. Stronger Every Day.',
    exercises: ['Bench Press', 'Incline Bench Press', 'Dumbbell Fly', 'Push-Ups', 'Tricep Dips', 'Rope Pushdown'],
    action: 'The girl is performing a Bench Press on a flat bench using a loaded Olympic barbell. She is lifting the bar with perfect form while smiling confidently.',
    background: 'Modern luxury gym with bench press station, dumbbells, mirrors, LED lighting and dramatic sunlight.'
  },
  Tuesday: {
    themeColor: 'from-blue-600/95 to-blue-950/95',
    themeClass: 'blue',
    icon: '📐 Back Muscle Icon',
    quote: 'Strong Back. Strong Mind.',
    exercises: ['Deadlift', 'Bent Over Row', 'Lat Pulldown', 'Seated Cable Row', 'Barbell Curl', 'Hammer Curl'],
    action: 'The girl is performing a One-Arm Dumbbell Row with one knee on a bench while lifting a heavy dumbbell.',
    background: 'Premium gym with cable machines, barbells and dumbbell racks.'
  },
  Wednesday: {
    themeColor: 'from-emerald-600/95 to-emerald-950/95',
    themeClass: 'green',
    icon: '🦵 Leg Icon',
    quote: 'Strong Legs. Strong Foundation.',
    exercises: ['Squat', 'Leg Press', 'Leg Curl', 'Leg Extension', 'Walking Lunges', 'Standing Calf Raises'],
    action: 'The girl is performing a Barbell Back Squat with excellent squat posture.',
    background: 'Professional squat rack area with weight plates and mirrors.'
  },
  Thursday: {
    themeColor: 'from-purple-600/95 to-purple-950/95',
    themeClass: 'purple',
    icon: '🛡️ Shoulder Icon',
    quote: 'Build Powerful Shoulders & Core.',
    exercises: ['Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Plank', 'Crunches', 'Hanging Leg Raise'],
    action: 'The girl is performing a Seated Dumbbell Shoulder Press while sitting on an adjustable bench.',
    background: 'Luxury gym with shoulder machines and free weights.'
  },
  Friday: {
    themeColor: 'from-sky-500/95 to-sky-950/95',
    themeClass: 'sky',
    icon: '⚡ Biceps Icon',
    quote: 'Strong Arms. Unlimited Power.',
    exercises: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Overhead Tricep Extension', 'Wrist Curl'],
    action: 'The girl is performing a Standing Dumbbell Bicep Curl while smiling confidently.',
    background: 'Modern dumbbell section with mirrors and warm lighting.'
  },
  Saturday: {
    themeColor: 'from-orange-600/95 to-orange-950/95',
    themeClass: 'orange',
    icon: '🌐 Full Body Icon',
    quote: 'Train Hard. Be Unstoppable.',
    exercises: ['Squat', 'Bench Press', 'Deadlift', 'Pull-Ups', 'Shoulder Press', 'Plank'],
    action: 'The girl is performing a Deadlift using an Olympic barbell with perfect lifting posture.',
    background: 'Premium functional training gym with barbells, racks and strength equipment.'
  },
  Sunday: {
    themeColor: 'from-cyan-500/95 to-cyan-950/95',
    themeClass: 'light-blue',
    icon: '🧘 Lotus / Recovery Icon',
    quote: 'Rest. Recover. Grow Stronger.',
    exercises: ['Stretching', 'Yoga', 'Foam Rolling', 'Walking', 'Deep Breathing'],
    action: 'The girl is sitting on a yoga mat while performing a seated side stretch in a peaceful yoga pose.',
    background: 'Bright yoga studio with plants, wooden flooring, large windows, soft sunrise light and peaceful atmosphere.'
  }
};

function getBreakfastDescription(day: string): string {
  switch (day) {
    case 'Monday': return '4 fluffy Idlis, Hot Sambar, Peanut Chutney, 3 Boiled Eggs, 1 Banana, 1 Glass of Milk';
    case 'Tuesday': return 'Crispy Golden Dosa, Egg Curry, Coconut Chutney, 1 Glass of Milk';
    case 'Wednesday': return 'Ven Pongal topped with roasted cashews, Hot Sambar, 3 Boiled Eggs, 1 Banana';
    case 'Thursday': return 'Ragi Dosa, Peanut Chutney, 3-Egg Omelette, 1 Glass of Milk';
    case 'Friday': return 'Soft Appam, Egg Curry, Coconut Milk, 1 Glass of Milk';
    case 'Saturday': return 'Fluffy Poori, Potato Masala, 3-Egg Omelette, 1 Glass of Milk';
    case 'Sunday': return 'Ven Pongal, Hot Sambar, Coconut Chutney, 3 Boiled Eggs';
    default: return '';
  }
}

function getBreakfastCalories(day: string): number {
  switch (day) {
    case 'Monday': return 650;
    case 'Tuesday': return 580;
    case 'Wednesday': return 620;
    case 'Thursday': return 590;
    case 'Friday': return 560;
    case 'Saturday': return 640;
    case 'Sunday': return 550;
    default: return 500;
  }
}

// Interfaces for our state model are declared at the top of the file

export default function App() {
  // ---------------------------------------------------------------------------
  // 1. STATE INITIALIZATION
  // ---------------------------------------------------------------------------

  // User Profile
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('pulsefit_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Alex Johnson' || parsed.name === 'Alex') {
          return {
            name: 'Abinaya',
            nickname: 'abi',
            tier: 'Pro Member',
            avatarGradient: 'from-purple-500 to-pink-500',
            dailyCalorieGoal: 2000,
            weightGoal: 78,
            currentWeight: 82,
          };
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing profile", e);
      }
    }
    return {
      name: 'Abinaya',
      nickname: 'abi',
      tier: 'Pro Member',
      avatarGradient: 'from-purple-500 to-pink-500',
      dailyCalorieGoal: 2000,
      weightGoal: 78,
      currentWeight: 82,
    };
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout-plan' | 'nutrition' | 'history'>('dashboard');

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chloe Coach Speech state
  const [chloeSpeechOverride, setChloeSpeechOverride] = useState<string | null>(null);

  // Daily Streak
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('pulsefit_streak');
    return saved ? parseInt(saved, 10) : 12;
  });

  // Selected Day State (Monday to Sunday)
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const saved = localStorage.getItem('pulsefit_selected_day');
    return saved ? saved : todayStr;
  });

  const waterTarget = 3000;

  // Active Routine ID
  const [activeRoutineId, setActiveRoutineId] = useState(() => {
    const saved = localStorage.getItem('pulsefit_active_routine');
    return saved ? saved : 'chest-triceps';
  });

  // Daily Water Intake by Day
  const [waterByDay, setWaterByDay] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pulsefit_water_by_day');
    if (saved) return JSON.parse(saved);
    const legacyWater = localStorage.getItem('pulsefit_water');
    const initWater = legacyWater ? parseInt(legacyWater, 10) : 1250;
    return {
      Monday: initWater,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0
    };
  });

  // Routines & Exercises by Day
  const [routinesByDay, setRoutinesByDay] = useState<Record<string, Routine[]>>(() => {
    const saved = localStorage.getItem('pulsefit_routines_by_day');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasOldExercises = Object.values(parsed).some((rList: any) => 
          Array.isArray(rList) && rList.some((r: any) => r.exercises && r.exercises.some((ex: any) => ex.id.startsWith('ex')))
        );
        if (!hasOldExercises) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing saved routines:', e);
      }
    }
    return DEFAULT_ROUTINES_BY_DAY;
  });

  // Dietary Meals by Day
  const [mealsByDay, setMealsByDay] = useState<Record<string, Meal[]>>(() => {
    const saved = localStorage.getItem('pulsefit_meals_by_day');
    if (saved) {
      // Migrate saved state to ensure breakfast contains the new premium posters and menus
      try {
        const parsed = JSON.parse(saved);
        const updated = { ...parsed };
        Object.keys(DAY_POSTERS).forEach(day => {
          if (!updated[day]) updated[day] = [];
          const breakfastIdx = updated[day].findIndex((m: any) => m.type === 'Breakfast');
          if (breakfastIdx > -1) {
            updated[day][breakfastIdx] = {
              ...updated[day][breakfastIdx],
              name: 'Breakfast Poster',
              photoUrl: DAY_POSTERS[day],
              description: getBreakfastDescription(day),
              calories: getBreakfastCalories(day)
            };
          } else {
            updated[day].unshift({
              id: `m-${day.toLowerCase()}-bf`,
              name: 'Breakfast Poster',
              type: 'Breakfast',
              calories: getBreakfastCalories(day),
              description: getBreakfastDescription(day),
              completed: false,
              photoUrl: DAY_POSTERS[day],
              emoji: '🌅'
            });
          }
        });
        return updated;
      } catch (e) {
        // Fallback below
      }
    }

    return {
      Monday: [
        { id: 'meal1', name: 'Breakfast Poster', type: 'Breakfast', calories: 650, description: '4 fluffy Idlis, Hot Sambar, Peanut Chutney, 3 Boiled Eggs, 1 Banana, 1 Glass of Milk', completed: true, photoUrl: '/src/assets/images/monday_chest_triceps_1784032816703.jpg', emoji: '🌅' },
        { id: 'meal2', name: 'Lunch', type: 'Lunch', calories: 650, description: 'Chicken Rice Bowl', completed: false, photoUrl: null, emoji: '☀️' },
        { id: 'meal3', name: 'Dinner', type: 'Dinner', calories: 400, description: 'Grilled Fish & Veggies', completed: false, photoUrl: null, emoji: '🌙' }
      ],
      Tuesday: [
        { id: 'm2-1', name: 'Breakfast Poster', type: 'Breakfast', calories: 580, description: 'Crispy Golden Dosa, Egg Curry, Coconut Chutney, 1 Glass of Milk', completed: false, photoUrl: '/src/assets/images/tuesday_back_biceps_1784032835806.jpg', emoji: '🌅' },
        { id: 'm2-2', name: 'Lunch', type: 'Lunch', calories: 600, description: 'Turkey Breast & Sweet Potato', completed: false, photoUrl: null, emoji: '☀️' },
        { id: 'm2-3', name: 'Dinner', type: 'Dinner', calories: 550, description: 'Salmon with Quinoa', completed: false, photoUrl: null, emoji: '🌙' },
        { id: 'm2-4', name: 'Snack', type: 'Snack', calories: 150, description: 'Greek Yogurt with Berries', completed: false, photoUrl: null, emoji: '🍇' }
      ],
      Wednesday: [
        { id: 'm3-1', name: 'Breakfast Poster', type: 'Breakfast', calories: 620, description: 'Ven Pongal topped with roasted cashews, Hot Sambar, 3 Boiled Eggs, 1 Banana', completed: false, photoUrl: '/src/assets/images/wednesday_leg_day_1784032848798.jpg', emoji: '🌅' },
        { id: 'm3-2', name: 'Lunch', type: 'Lunch', calories: 700, description: 'Beef Stir Fry with Broccoli', completed: false, photoUrl: null, emoji: '☀️' },
        { id: 'm3-3', name: 'Dinner', type: 'Dinner', calories: 380, description: 'Tofu & Mixed Veggies Sauté', completed: false, photoUrl: null, emoji: '🌙' },
        { id: 'm3-4', name: 'Snack', type: 'Snack', calories: 200, description: 'Rice Cakes with Peanut Butter', completed: false, photoUrl: null, emoji: '🥞' }
      ],
      Thursday: [
        { id: 'm4-1', name: 'Breakfast Poster', type: 'Breakfast', calories: 590, description: 'Ragi Dosa, Peanut Chutney, 3-Egg Omelette, 1 Glass of Milk', completed: false, photoUrl: '/src/assets/images/thursday_shoulders_abs_1784032861894.jpg', emoji: '🌅' },
        { id: 'm4-2', name: 'Lunch', type: 'Lunch', calories: 480, description: 'Shrimp Salad with Vinaigrette', completed: false, photoUrl: null, emoji: '☀️' },
        { id: 'm4-3', name: 'Dinner', type: 'Dinner', calories: 520, description: 'Lean Pork Chop & Baked Potato', completed: false, photoUrl: null, emoji: '🌙' },
        { id: 'm4-4', name: 'Snack', type: 'Snack', calories: 160, description: 'Protein Shake', completed: false, photoUrl: null, emoji: '🥛' }
      ],
      Friday: [
        { id: 'm5-1', name: 'Breakfast Poster', type: 'Breakfast', calories: 560, description: 'Soft Appam, Egg Curry, Coconut Milk, 1 Glass of Milk', completed: false, photoUrl: '/src/assets/images/friday_arms_1784032873372.jpg', emoji: '🌅' },
        { id: 'm5-2', name: 'Lunch', type: 'Lunch', calories: 500, description: 'Tuna Salad Wrap', completed: false, photoUrl: null, emoji: '☀️' },
        { id: 'm5-3', name: 'Dinner', type: 'Dinner', calories: 680, description: 'Steak & Roasted Cauliflower', completed: false, photoUrl: null, emoji: '🌙' },
        { id: 'm5-4', name: 'Snack', type: 'Snack', calories: 220, description: 'Mixed Nuts', completed: false, photoUrl: null, emoji: '🥜' }
      ],
      Saturday: [
        { id: 'm6-1', name: 'Breakfast Poster', type: 'Breakfast', calories: 640, description: 'Fluffy Poori, Potato Masala, 3-Egg Omelette, 1 Glass of Milk', completed: false, photoUrl: '/src/assets/images/saturday_full_body_1784032884047.jpg', emoji: '🌅' },
        { id: 'm6-2', name: 'Lunch', type: 'Lunch', calories: 450, description: 'Grilled Chicken Caesar Salad', completed: false, photoUrl: null, emoji: '☀️' },
        { id: 'm6-3', name: 'Dinner', type: 'Dinner', calories: 350, description: 'Baked Cod with Roasted Broccoli', completed: false, photoUrl: null, emoji: '🌙' },
        { id: 'm6-4', name: 'Snack', type: 'Snack', calories: 120, description: 'Green Smoothie', completed: false, photoUrl: null, emoji: '🥦' }
      ],
      Sunday: [
        { id: 'm7-1', name: 'Breakfast Poster', type: 'Breakfast', calories: 550, description: 'Ven Pongal, Hot Sambar, Coconut Chutney, 3 Boiled Eggs', completed: false, photoUrl: '/src/assets/images/sunday_recovery_day_1784032897057.jpg', emoji: '🌅' },
        { id: 'm7-2', name: 'Lunch', type: 'Lunch', calories: 480, description: 'Quinoa Salad with Chickpeas', completed: false, photoUrl: null, emoji: '☀️' },
        { id: 'm7-3', name: 'Dinner', type: 'Dinner', calories: 310, description: 'Light Vegetable Soup & Rye Bread', completed: false, photoUrl: null, emoji: '🌙' },
        { id: 'm7-4', name: 'Snack', type: 'Snack', calories: 150, description: 'Dark Chocolate', completed: false, photoUrl: null, emoji: '🍫' }
      ]
    };
  });

  // Getters for computed data based on selected day
  const meals = mealsByDay[selectedDay] || [];
  const routines = routinesByDay[selectedDay] || [];
  const waterIntake = waterByDay[selectedDay] || 0;

  // React state setters that operate transparently on the active selected day
  const setMeals = (val: Meal[] | ((prev: Meal[]) => Meal[])) => {
    setMealsByDay(prev => {
      const currentMeals = prev[selectedDay] || [];
      const updatedMeals = typeof val === 'function' ? val(currentMeals) : val;
      return { ...prev, [selectedDay]: updatedMeals };
    });
  };

  const setRoutines = (val: Routine[] | ((prev: Routine[]) => Routine[])) => {
    setRoutinesByDay(prev => {
      const currentRoutines = prev[selectedDay] || [];
      const updatedRoutines = typeof val === 'function' ? val(currentRoutines) : val;
      return { ...prev, [selectedDay]: updatedRoutines };
    });
  };

  const setWaterIntake = (val: number | ((prev: number) => number)) => {
    setWaterByDay(prev => {
      const currentWater = prev[selectedDay] || 0;
      const updatedWater = typeof val === 'function' ? val(currentWater) : val;
      return { ...prev, [selectedDay]: updatedWater };
    });
  };

  // History Logs
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    const saved = localStorage.getItem('pulsefit_history');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log1',
        type: 'workout',
        title: 'Workout Completed',
        description: 'Completed Chest & Triceps Routine',
        timestamp: 'Yesterday, 8:40 AM',
        caloriesBurned: 450
      },
      {
        id: 'log2',
        type: 'diet',
        title: 'Logged Dinner',
        description: 'Grilled Fish • 400 kcal',
        timestamp: 'Yesterday, 7:15 PM',
        calories: 400
      },
      {
        id: 'log3',
        type: 'streak',
        title: 'Streak Advanced',
        description: 'Reached 12 Days streak!',
        timestamp: 'Yesterday, 9:00 PM'
      },
      {
        id: 'log4',
        type: 'water',
        title: 'Hydration Target Achieved',
        description: 'Consumed 3,250 ml of water',
        timestamp: '2 days ago, 10:15 PM'
      }
    ];
  });

  // Notification state
  const [notifications, setNotifications] = useState([
    { id: 'notif1', text: '🔥 12 Days Streak! Keep it burning!', read: false, time: '2h ago' },
    { id: 'notif2', text: '🥑 Complete your Dietary Logs for Lunch.', read: false, time: '3h ago' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Active Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<{[key: string]: boolean}>({});

  // Form states
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState('');
  const [newMealType, setNewMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Snack');
  const [newMealDesc, setNewMealDesc] = useState('');
  const [newMealEmoji, setNewMealEmoji] = useState('🍎');

  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('12');

  const [editProfileName, setEditProfileName] = useState(profile.name);
  const [editProfileNickname, setEditProfileNickname] = useState(profile.nickname || 'abi');
  const [editProfileCalorieGoal, setEditProfileCalorieGoal] = useState(String(profile.dailyCalorieGoal));
  const [editProfileWeight, setEditProfileWeight] = useState(String(profile.currentWeight));
  const [editProfileGoalWeight, setEditProfileGoalWeight] = useState(String(profile.weightGoal));

  // File Upload refs
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  // Save to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('pulsefit_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('pulsefit_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('pulsefit_water_by_day', JSON.stringify(waterByDay));
  }, [waterByDay]);

  useEffect(() => {
    localStorage.setItem('pulsefit_active_routine', activeRoutineId);
  }, [activeRoutineId]);

  useEffect(() => {
    localStorage.setItem('pulsefit_routines_by_day', JSON.stringify(routinesByDay));
  }, [routinesByDay]);

  useEffect(() => {
    localStorage.setItem('pulsefit_meals_by_day', JSON.stringify(mealsByDay));
  }, [mealsByDay]);

  useEffect(() => {
    localStorage.setItem('pulsefit_selected_day', selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    localStorage.setItem('pulsefit_history', JSON.stringify(historyLogs));
  }, [historyLogs]);

  // Sync activeRoutineId with current day's first routine if selectedDay changes
  useEffect(() => {
    if (routines.length > 0) {
      setActiveRoutineId(routines[0].id);
    }
  }, [selectedDay]);

  // ---------------------------------------------------------------------------
  // 2. HELPER FUNCTIONS & CALCULATIONS
  // ---------------------------------------------------------------------------

  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routines[0];

  // Active exercises
  const totalExercises = activeRoutine.exercises.length;
  const completedExercisesCount = activeRoutine.exercises.filter(ex => ex.completed).length;
  const workoutProgressPercent = totalExercises > 0 ? Math.round((completedExercisesCount / totalExercises) * 100) : 0;

  // Active Meals
  const totalMealsCount = meals.length;
  const completedMealsCount = meals.filter(m => m.completed).length;
  const dietProgressPercent = totalMealsCount > 0 ? Math.round((completedMealsCount / totalMealsCount) * 100) : 0;

  // Total Calories Consumed
  const totalCaloriesConsumed = meals.reduce((sum, m) => sum + (m.completed ? m.calories : 0), 0);

  // Overall Score (average of workout and meals, or custom)
  const overallScorePercent = Math.round((workoutProgressPercent + dietProgressPercent) / 2);

  // Dynamic Date Header
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    // Replace commas for sleek aesthetic
    return dateStr.replace(/,/g, '');
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Toggle meal completion
  const handleToggleMeal = (id: string) => {
    setMeals(prev => prev.map(m => {
      if (m.id === id) {
        const updatedStatus = !m.completed;
        // Log to history if marked completed
        if (updatedStatus) {
          addHistoryEntry('diet', `Logged ${m.name}`, `${m.description} • ${m.calories} kcal`, m.calories);
        }
        return { ...m, completed: updatedStatus };
      }
      return m;
    }));
  };

  // Toggle exercise completion
  const handleToggleExercise = (exerciseId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === activeRoutineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => {
            if (ex.id === exerciseId) {
              return { ...ex, completed: !ex.completed };
            }
            return ex;
          })
        };
      }
      return r;
    }));
  };

  // Complete Workout action
  const handleCompleteWorkout = () => {
    // Increment streak
    setStreak(prev => prev + 1);
    // Track in history
    addHistoryEntry('workout', 'Workout Completed', `Finished ${activeRoutine.name} Routine`, undefined, 350);
    addHistoryEntry('streak', 'Streak Advanced', `Successfully hit ${streak + 1} Days Streak!`);
    
    // Auto complete all remaining exercises
    setRoutines(prev => prev.map(r => {
      if (r.id === activeRoutineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => ({ ...ex, completed: true }))
        };
      }
      return r;
    }));

    // Trigger Success Modal
    setShowCelebrationModal(true);

    // Trigger Notification
    setNotifications(prev => [
      { id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text: `🎉 Completed ${activeRoutine.name}! Streak advanced to ${streak + 1}!`, read: false, time: 'Just now' },
      ...prev
    ]);
  };

  // Add Custom Meal
  const handleAddMeal = (e: FormEvent) => {
    e.preventDefault();
    if (!newMealName || !newMealCalories) return;

    const newMeal: Meal = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newMealName,
      type: newMealType,
      calories: parseInt(newMealCalories, 10),
      description: newMealDesc || 'Custom healthy addition',
      completed: false,
      photoUrl: null,
      emoji: newMealEmoji
    };

    setMeals(prev => [...prev, newMeal]);
    setNewMealName('');
    setNewMealCalories('');
    setNewMealDesc('');
    setNewMealEmoji('🍎');
    setShowAddMealModal(false);

    // Toast Notification
    setNotifications(prev => [
      { id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, text: `🍱 Added new meal: ${newMealName}`, read: false, time: 'Just now' },
      ...prev
    ]);
  };

  // Add Exercise to Routine
  const handleAddExercise = (e: FormEvent) => {
    e.preventDefault();
    if (!newExName) return;

    const newEx: Exercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: newExName,
      sets: newExSets,
      reps: newExReps,
      completed: false
    };

    setRoutines(prev => prev.map(r => {
      if (r.id === activeRoutineId) {
        return {
          ...r,
          exercises: [...r.exercises, newEx]
        };
      }
      return r;
    }));

    setNewExName('');
    setNewExSets('3');
    setNewExReps('12');
    setShowAddExerciseModal(false);
  };

  // Delete exercise
  const handleDeleteExercise = (exId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === activeRoutineId) {
        return {
          ...r,
          exercises: r.exercises.filter(ex => ex.id !== exId)
        };
      }
      return r;
    }));
  };

  // Update user profile info
  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: editProfileName || 'Abinaya',
      nickname: editProfileNickname || 'abi',
      dailyCalorieGoal: parseInt(editProfileCalorieGoal, 10) || 2000,
      currentWeight: parseFloat(editProfileWeight) || 82,
      weightGoal: parseFloat(editProfileGoalWeight) || 78,
    }));
    setShowProfileModal(false);
  };

  // Add history logs
  const addHistoryEntry = (
    type: 'workout' | 'diet' | 'water' | 'streak',
    title: string,
    description: string,
    calories?: number,
    caloriesBurned?: number
  ) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedStamp = `Today, ${timeString}`;

    const newLog: HistoryLog = {
      id: `history-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      title,
      description,
      timestamp: formattedStamp,
      calories,
      caloriesBurned
    };

    setHistoryLogs(prev => [newLog, ...prev]);
  };

  // Reset Today's Stats
  const handleResetDaily = () => {
    if (confirm("Are you sure you want to reset today's logs? This will reset water intake and completed tasks.")) {
      setWaterIntake(0);
      setMeals(prev => prev.map(m => ({ ...m, completed: false, photoUrl: null })));
      setRoutines(prev => prev.map(r => ({
        ...r,
        exercises: r.exercises.map(ex => ({ ...ex, completed: false }))
      })));
      addHistoryEntry('streak', 'Daily Reset Triggered', 'Successfully reset progress metrics');
    }
  };

  // Water Increment Action
  const handleAddWater = (amount: number) => {
    setWaterIntake(prev => {
      const updated = Math.min(prev + amount, 6000); // Max 6L cap
      // Log landmark
      if (prev < waterTarget && updated >= waterTarget) {
        addHistoryEntry('water', 'Hydration Target Achieved', `Completed daily water goal of ${waterTarget} ml!`);
      }
      return updated;
    });
  };

  // Reset Water
  const handleResetWater = () => {
    setWaterIntake(0);
  };

  // ---------------------------------------------------------------------------
  // 3. PHOTO DRAG-AND-DROP & SELECTION SUPPORT
  // ---------------------------------------------------------------------------

  const triggerFileSelect = (mealId: string) => {
    fileInputRefs.current[mealId]?.click();
  };

  const handlePhotoFile = (mealId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file only.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setMeals(prev => prev.map(m => {
        if (m.id === mealId) {
          return { ...m, photoUrl: dataUrl, completed: true };
        }
        return m;
      }));
      // Auto-completed log entry
      const mealName = meals.find(m => m.id === mealId)?.name || 'Meal';
      addHistoryEntry('diet', `Logged ${mealName} with photo`, `Uploaded a custom photo for dietary verification!`, undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (mealId: string, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handlePhotoFile(mealId, files[0]);
    }
  };

  const handleDrag = (mealId: string, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [mealId]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [mealId]: false }));
    }
  };

  const handleDrop = (mealId: string, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [mealId]: false }));

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handlePhotoFile(mealId, files[0]);
    }
  };

  // Check SVG circumference parameters
  // Outer circle: r=80, length = 2 * Math.PI * 80 ≈ 502.65
  // Inner circle: r=62, length = 2 * Math.PI * 62 ≈ 389.56
  const outerCircumference = 502.65;
  const innerCircumference = 389.56;

  const outerStrokeOffset = outerCircumference - (dietProgressPercent / 100) * outerCircumference;
  const innerStrokeOffset = innerCircumference - (workoutProgressPercent / 100) * innerCircumference;

  return (
    <div id="pulsefit-root" className="w-full min-h-screen bg-[#0A0A0C] text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden antialiased">
      
      {/* -----------------------------------------------------------------------
          SIDEBAR NAVIGATION
          ----------------------------------------------------------------------- */}
      <aside className="w-full md:w-64 md:h-screen border-b md:border-b-0 md:border-r border-white/10 bg-[#111114] flex flex-col p-6 shrink-0 justify-between">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between md:justify-start gap-3 mb-4 md:mb-10">
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group/logo hover:opacity-80 transition-opacity"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">PulseFit</span>
                {/* Menu toggle indicator on mobile */}
                <span className="md:hidden text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
                </span>
              </div>
            </div>
            {/* Quick stats on mobile sidebar */}
            <div className="md:hidden flex items-center gap-2 bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full border border-orange-500/20 text-xs">
              <span className="text-xs">🔥</span>
              <span className="font-bold">{streak} Days</span>
            </div>
          </div>

          {/* Navigation Links (visible by default on desktop, conditional on mobile) */}
          <nav className={`space-y-2.5 ${mobileMenuOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
            <button 
              id="nav-dashboard"
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all rounded-xl ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600/10 border-l-2 border-blue-500 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              {overallScorePercent > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">{overallScorePercent}%</span>
              )}
            </button>

            <button 
              id="nav-workout-plan"
              onClick={() => {
                setActiveTab('workout-plan');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all rounded-xl ${
                activeTab === 'workout-plan' 
                  ? 'bg-blue-600/10 border-l-2 border-blue-500 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5" />
                <span>Workout Plan</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {completedExercisesCount}/{totalExercises}
              </span>
            </button>

            <button 
              id="nav-nutrition"
              onClick={() => {
                setActiveTab('nutrition');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all rounded-xl ${
                activeTab === 'nutrition' 
                  ? 'bg-blue-600/10 border-l-2 border-blue-500 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5" />
                <span>Nutrition & Diet</span>
              </div>
              {waterIntake > 0 && (
                <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">
                  {Math.round((waterIntake / waterTarget) * 100)}% H₂O
                </span>
              )}
            </button>

            <button 
              id="nav-history"
              onClick={() => {
                setActiveTab('history');
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all rounded-xl ${
                activeTab === 'history' 
                  ? 'bg-blue-600/10 border-l-2 border-blue-500 text-blue-400 font-semibold shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span>History Logs</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            </button>
          </nav>
        </div>

        {/* User Profile Card Footer */}
        <div className={`mt-8 md:mt-0 ${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
          <div 
            onClick={() => {
              setEditProfileName(profile.name);
              setEditProfileNickname(profile.nickname || 'abi');
              setEditProfileCalorieGoal(String(profile.dailyCalorieGoal));
              setEditProfileWeight(String(profile.currentWeight));
              setEditProfileGoalWeight(String(profile.weightGoal));
              setShowProfileModal(true);
            }}
            className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
            title="Click to customize profile goals"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${profile.avatarGradient} border-2 border-white/20 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform`}>
                {profile.name.charAt(0)}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
                  <Edit3 className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-slate-500">{profile.tier}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* -----------------------------------------------------------------------
          MAIN VIEW CONTAINER
          ----------------------------------------------------------------------- */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* Dynamic Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">
              {getGreeting()}, {profile.nickname || profile.name.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {getFormattedDate()} • <span className="text-blue-400 font-semibold">{activeRoutine.name} Day</span>
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Quick Reset Trigger */}
            <button 
              onClick={handleResetDaily}
              className="p-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 text-slate-400 hover:text-red-400 rounded-xl transition-all"
              title="Reset today's logs"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Streak Counter */}
            <div 
              className="bg-orange-500/10 text-orange-500 px-4 py-2.5 rounded-xl border border-orange-500/20 flex items-center gap-2 cursor-help shadow-lg shadow-orange-950/20 active:scale-95 transition-all"
              onClick={() => alert(`Your daily streak is burning bright! Log meals and complete workouts daily to extend your streak of ${streak} days.`)}
            >
              <Flame className="w-5 h-5 animate-bounce text-orange-400" />
              <span className="font-bold text-sm tracking-tight">{streak} Days Streak</span>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-[#111114] border border-white/15 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Tips</span>
                    <button 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        setShowNotifications(false);
                      }}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No new notifications</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2.5 bg-white/5 rounded-xl text-xs flex justify-between gap-2 border border-white/5">
                          <div>
                            <p className="text-slate-200">{n.text}</p>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block">{n.time}</span>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full self-center shrink-0"></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* -----------------------------------------------------------------------
            WEEKDAY SELECTOR (Monday to Sunday)
            ----------------------------------------------------------------------- */}
        <div className="mb-8 bg-[#111114] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Weekly Planner</span>
              <span className="text-sm font-bold text-slate-200">Select active tracking day:</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const isActive = day === selectedDay;
              
              const dayMeals = mealsByDay[day] || [];
              const dayRoutines = routinesByDay[day] || [];
              const totalDayMeals = dayMeals.length;
              const completedDayMeals = dayMeals.filter(m => m.completed).length;
              const hasMealsCompleted = totalDayMeals > 0 && completedDayMeals === totalDayMeals;
              
              const dayActiveRoutine = dayRoutines[0];
              const totalDayEx = dayActiveRoutine ? dayActiveRoutine.exercises.length : 0;
              const completedDayEx = dayActiveRoutine ? dayActiveRoutine.exercises.filter(ex => ex.completed).length : 0;
              const hasWorkoutCompleted = totalDayEx > 0 && completedDayEx === totalDayEx;
              
              const todayLong = new Date().toLocaleDateString('en-US', { weekday: 'long' });
              const isTodayActual = day === todayLong;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-102 border border-blue-500 font-extrabold'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                  style={{ minWidth: '70px' }}
                >
                  <span className="tracking-tight">{day.substring(0, 3)}</span>
                  {isTodayActual && (
                    <span className={`text-[8px] uppercase px-1 rounded-sm ${isActive ? 'bg-blue-700 text-blue-200' : 'bg-blue-500/20 text-blue-400'}`}>
                      Today
                    </span>
                  )}
                  <div className="flex gap-1 mt-0.5">
                    {hasWorkoutCompleted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Workout complete"></span>
                    )}
                    {hasMealsCompleted && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Nutrition complete"></span>
                    )}
                    {!hasWorkoutCompleted && completedDayEx > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Workout in progress"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            TAB 1: MAIN DASHBOARD
            ----------------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-grid">
            
            {/* Left Column - Progress & Inspiration (col-span-4) */}
            <section className="lg:col-span-4 flex flex-col gap-6" id="progress-column">
              
              {/* Overall Progress Circle */}
              <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                
                <div className="w-full flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-white tracking-tight">Today's Progress</h2>
                  <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    Score: {overallScorePercent}%
                  </span>
                </div>

                {/* Responsive 2-column core vs coach grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 items-center w-full mt-2">
                  
                  {/* Left Column: Weighted Core Gauge & Progress Legends */}
                  <div className="flex flex-col items-center w-full">
                    {/* SVG Gauge System */}
                    <div className="relative flex items-center justify-center my-4">
                      <svg className="w-48 h-48 transform -rotate-90">
                        {/* Outer Circle (Diet Progress) */}
                        <circle 
                          cx="96" 
                          cy="96" 
                          r="80" 
                          stroke="rgba(255, 255, 255, 0.03)" 
                          strokeWidth="12" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="96" 
                          cy="96" 
                          r="80" 
                          stroke="#2563EB" 
                          strokeWidth="12" 
                          fill="transparent" 
                          strokeDasharray={outerCircumference} 
                          strokeDashoffset={outerStrokeOffset} 
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />

                        {/* Inner Circle (Workout Progress) */}
                        <circle 
                          cx="96" 
                          cy="96" 
                          r="62" 
                          stroke="rgba(255, 255, 255, 0.03)" 
                          strokeWidth="12" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="96" 
                          cy="96" 
                          r="62" 
                          stroke="#22C55E" 
                          strokeWidth="12" 
                          fill="transparent" 
                          strokeDasharray={innerCircumference} 
                          strokeDashoffset={innerStrokeOffset} 
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>

                      {/* Center percentage summary */}
                      <div className="absolute text-center">
                        <p className="text-3.5xl font-extrabold text-white tracking-tight font-mono">{overallScorePercent}%</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Weighted Score</p>
                      </div>
                    </div>

                    {/* Progress Legend / Details */}
                    <div className="w-full space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center bg-white/2 p-2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                          <span className="text-xs text-slate-300 font-medium">Dietary Tracking</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-200">
                          {completedMealsCount}/{totalMealsCount} Meals
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-white/2 p-2 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                          <span className="text-xs text-slate-300 font-medium">Workout Progress</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-green-400">
                          {completedExercisesCount}/{totalExercises} Done
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pixar Female Fitness Assistant (Coach Chloe) */}
                  {overallScorePercent === 100 ? (
                    <div className="flex flex-col w-full pt-6 sm:pt-0 lg:pt-6 xl:pt-0 border-t sm:border-t-0 lg:border-t xl:border-t-0 sm:border-l lg:border-l-0 xl:border-l border-white/5 sm:pl-6 lg:pl-0 xl:pl-6 h-full min-h-[320px]">
                      <motion.div 
                        className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-amber-500/20 bg-slate-950 cursor-pointer shadow-2xl flex items-center justify-center group"
                        onClick={() => setLightboxImage(PIXAR_GIRL_DANCING)}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Immersive glow background */}
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full blur-3xl opacity-60 bg-amber-500 animate-pulse pointer-events-none"></div>
                        
                        {/* Full size dancing character */}
                        <motion.img 
                          src={PIXAR_GIRL_DANCING} 
                          alt="Coach Chloe Dancing" 
                          className="w-full h-full min-h-[300px] object-cover relative z-0"
                          referrerPolicy="no-referrer"
                          animate={{
                            y: [0, -15, 0, -15, 0],
                            rotate: [0, -6, 6, -6, 6, 0],
                            scale: [1, 1.03, 0.97, 1.03, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Sparkly particles floating effect */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                          <PartyPopper className="w-3 h-3" /> Dancing! 💃
                        </div>

                        {/* Custom visual hint on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <p className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                            Click to Enlarge 🔍
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="flex flex-col w-full pt-6 sm:pt-0 lg:pt-6 xl:pt-0 border-t sm:border-t-0 lg:border-t xl:border-t-0 sm:border-l lg:border-l-0 xl:border-l border-white/5 sm:pl-6 lg:pl-0 xl:pl-6 h-full min-h-[320px]">
                      <motion.div 
                        className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-white/10 bg-slate-950 cursor-pointer shadow-2xl flex items-center justify-center group"
                        onClick={() => setLightboxImage(PIXAR_GIRL_THUMBSUP)}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Immersive glow background */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full blur-3xl opacity-40 bg-blue-500 pointer-events-none"></div>
                        
                        {/* Full size character with gentle breathing animation (no dancing) */}
                        <motion.img 
                          src={PIXAR_GIRL_THUMBSUP} 
                          alt="Coach Chloe" 
                          className="w-full h-full min-h-[300px] object-cover relative z-0"
                          referrerPolicy="no-referrer"
                          animate={{
                            y: [0, -3, 0],
                            scale: [1, 1.01, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Status badge */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-blue-600/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                          <Smile className="w-3.5 h-3.5" /> 👍
                        </div>

                        {/* Info Speech bubble overlay */}
                        <div className="absolute bottom-4 inset-x-4 z-20 bg-black/85 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-2 shadow-xl">
                          <p className="text-[10px] text-slate-300 leading-normal">
                            "You're doing great! We're <span className="text-blue-400 font-extrabold font-mono">{overallScorePercent}%</span> of the way there. Hit <span className="text-amber-400 font-extrabold">100%</span> to see me dance! 💃"
                          </p>
                          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${overallScorePercent}%` }}></div>
                          </div>
                        </div>

                        {/* Custom visual hint on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                          <p className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                            Click to Enlarge 🔍
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  )}

                </div>
              </div>

              {/* Quotes / Achievements */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-all"></div>
                <Sparkles className="w-5 h-5 text-indigo-200 mb-3 animate-spin" style={{ animationDuration: '6s' }} />
                <p className="italic text-base md:text-lg mb-4 text-slate-100 font-medium leading-relaxed">
                  "Strength does not come from winning. Your struggles develop your strengths."
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-indigo-100 font-semibold tracking-wider uppercase">— Arnold Schwarzenegger</p>
                  <Award className="w-5 h-5 text-yellow-300" />
                </div>
              </div>
            </section>

              {/* Middle Column - Dietary Logs (col-span-4) */}
            <section className="lg:col-span-4 bg-[#111114] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl" id="diet-column">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Dietary Logs</h2>
                  <p className="text-xs text-slate-500 font-medium">{totalCaloriesConsumed} / {profile.dailyCalorieGoal} kcal consumed</p>
                </div>
                <button 
                  onClick={() => setShowAddMealModal(true)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Meal
                </button>
              </div>

              {/* Premium 3D Pixar Poster Showcase */}
              <div className="mb-6 relative rounded-2xl overflow-hidden border border-white/10 bg-[#16161a] p-3 flex flex-col group shadow-xl">
                {/* Dumbbell Icon & Poster Title header inside the poster itself */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> 3D Pixar Food Poster
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                    <Dumbbell className="w-3 h-3" /> {DAY_WORKOUT_NAMES[selectedDay]}
                  </span>
                </div>
                
                {/* Prominent Day Title */}
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest mb-2 px-1 text-center">
                  {selectedDay} – {DAY_WORKOUT_NAMES[selectedDay]}
                </h4>

                {/* The Poster image container */}
                <div 
                  onClick={() => setLightboxImage(DAY_POSTERS[selectedDay])}
                  className="relative aspect-[3/4] w-full rounded-xl overflow-hidden cursor-zoom-in group-hover:scale-[1.01] transition-all duration-500 shadow-2xl border border-white/5"
                >
                  <img 
                    src={DAY_POSTERS[selectedDay]} 
                    alt={`${selectedDay} Pixar Poster`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Warm morning golden ray gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"></div>
                  
                  {/* Dumbbell overlay matching the day's workout */}
                  <div className="absolute top-3 right-3 p-2 bg-blue-600/95 text-white rounded-xl shadow-lg border border-blue-400/50 backdrop-blur-sm flex items-center justify-center animate-bounce duration-[2000ms]">
                    <Dumbbell className="w-4 h-4" />
                  </div>

                  {/* Sparkle effects overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-300 rounded-full blur-xs animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full blur-xs animate-ping" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-blue-300 rounded-full blur-xs animate-ping" style={{ animationDuration: '5s' }}></div>
                  </div>

                  {/* Click to expand hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="text-xs font-extrabold text-white tracking-wider uppercase font-mono bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                      Expand Ultra HD 4K
                    </span>
                  </div>
                </div>

                {/* Poster Caption */}
                <p className="text-[10px] text-center text-slate-400 mt-2 italic px-2">
                  "Realistic 3D textures with warm morning sunlight on a fresh banana leaf presentation."
                </p>
              </div>

              {/* Meal List Container */}
              <div className="space-y-4 flex-1">
                {meals.map((meal) => (
                  <div 
                    key={meal.id} 
                    onDragEnter={(e) => handleDrag(meal.id, e)}
                    onDragOver={(e) => handleDrag(meal.id, e)}
                    onDragLeave={(e) => handleDrag(meal.id, e)}
                    onDrop={(e) => handleDrop(meal.id, e)}
                    className={`group relative border rounded-2xl p-4 transition-all duration-300 ${
                      meal.completed 
                        ? 'bg-blue-600/5 border-blue-500/25 shadow-md' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    } ${dragActive[meal.id] ? 'border-dashed border-blue-400 bg-blue-500/10 scale-98' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl overflow-hidden shadow-inner shrink-0">
                          {meal.photoUrl ? (
                            <img src={meal.photoUrl} alt="Meal" className="w-full h-full object-cover" />
                          ) : (
                            meal.emoji
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{meal.name}</p>
                          <p className="text-xs text-slate-500 leading-snug">{meal.description} • <span className="font-mono text-[11px] font-semibold text-slate-400">{meal.calories} kcal</span></p>
                        </div>
                      </div>

                      {/* Manual Complete Checkbox */}
                      <button 
                        onClick={() => handleToggleMeal(meal.id)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          meal.completed 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-500'
                        }`}
                        title={meal.completed ? "Mark incomplete" : "Mark completed"}
                      >
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </button>
                    </div>

                    {/* Integrated Photo Upload Zone & Action */}
                    <div className="flex gap-2 mt-2">
                      <input 
                        type="file" 
                        ref={el => fileInputRefs.current[meal.id] = el}
                        onChange={(e) => handleFileChange(meal.id, e)}
                        accept="image/*"
                        className="hidden" 
                      />
                      
                      {/* Photo Button with Click / Drag Hint */}
                      <button 
                        onClick={() => triggerFileSelect(meal.id)}
                        className="flex-1 py-2 bg-white/5 hover:bg-blue-600/20 rounded-xl text-[10px] font-bold text-slate-300 hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> 
                        {meal.photoUrl ? 'REPLACE PHOTO' : 'UPLOAD PHOTO / DRAG IMAGE'}
                      </button>

                      {/* Quick action helper when incomplete */}
                      {!meal.completed && (
                        <button 
                          onClick={() => handleToggleMeal(meal.id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-bold text-white shadow-lg shadow-blue-900/20 transition-all"
                        >
                          COMPLETE MEAL
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {meals.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-10 border border-dashed border-white/5 rounded-2xl">
                    No dietary logs added today.
                  </p>
                )}
              </div>
            </section>

            {/* Right Column - Workout Execution (col-span-4) */}
            <section className="lg:col-span-4 bg-[#111114] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl" id="workout-column">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">{activeRoutine.name}</h2>
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/10 uppercase tracking-wider">
                    {completedExercisesCount === totalExercises ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Est. Duration</p>
                  <p className="text-sm font-bold text-white tracking-tight font-mono">{activeRoutine.estimatedTime}</p>
                </div>
              </div>

              {/* Mini Pixar Character Fitness Poster Preview */}
              <div 
                onClick={() => setLightboxImage(DAY_WORKOUT_POSTERS[selectedDay])}
                className="mb-4 relative h-28 rounded-2xl overflow-hidden cursor-zoom-in group border border-white/10 flex items-center shadow-xl hover:border-blue-500/30 transition-all duration-300 shrink-0"
              >
                <img 
                  src={DAY_WORKOUT_POSTERS[selectedDay]} 
                  alt="Today's Active Workout Poster"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 p-4 max-w-[80%]">
                  <span className="text-[8px] font-extrabold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    3D Pixar Fitness Model
                  </span>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight mt-1">
                    {WORKOUT_METADATA[selectedDay].icon.split(' ')[0]} {selectedDay} – {DAY_WORKOUT_NAMES[selectedDay]}
                  </h4>
                  <p className="text-[9px] text-slate-300 italic line-clamp-1 mt-0.5">
                    "{WORKOUT_METADATA[selectedDay].quote}"
                  </p>
                </div>

                <div className="absolute right-4 bg-black/60 p-2 rounded-xl border border-white/10 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              {/* Scrollable Exercises List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
                {activeRoutine.exercises.map((ex) => (
                  <div 
                    key={ex.id}
                    onClick={() => handleToggleExercise(ex.id)}
                    className={`p-4 bg-white/5 border-l-4 rounded-r-xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between ${
                      ex.completed 
                        ? 'border-blue-500 bg-blue-600/5' 
                        : 'border-slate-700 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        ex.completed ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-500'
                      }`}>
                        {ex.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold leading-snug ${ex.completed ? 'text-slate-300 line-through' : 'text-white'}`}>
                          {ex.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{ex.sets} sets × {ex.reps} reps</p>
                      </div>
                    </div>
                  </div>
                ))}

                {activeRoutine.exercises.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-10 border border-dashed border-white/5 rounded-2xl">
                    No exercises inside this routine. Go to Workout Plan to add some.
                  </p>
                )}
              </div>

              {/* Big "COMPLETE WORKOUT" Call-to-action */}
              <button 
                onClick={handleCompleteWorkout}
                disabled={completedExercisesCount === 0}
                className={`mt-6 w-full py-4 transition-all text-sm font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-2 ${
                  completedExercisesCount > 0 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 hover:scale-[1.02] active:scale-98 cursor-pointer' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                COMPLETE WORKOUT
              </button>
            </section>

          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 2: WORKOUT PLAN (SELECT / EDIT ROUTINES)
            ----------------------------------------------------------------------- */}
        {activeTab === 'workout-plan' && (
          <div className="space-y-6" id="workout-plan-tab">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> 7 Days of Fitness: 3D Pixar Poster Collection
                </h2>
                <p className="text-xs text-slate-400">Click any card to activate that day's routine or expand to view the premium 3D illustration.</p>
              </div>
              <button 
                onClick={() => setShowAddExerciseModal(true)}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Exercise to Active Routine
              </button>
            </div>

            {/* Pixar Fitness Posters 7-Day Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const isSelected = selectedDay === day;
                const meta = WORKOUT_METADATA[day];
                const posterPath = DAY_WORKOUT_POSTERS[day];
                const dayRoutine = (routinesByDay[day] || [])[0];
                const totalCount = dayRoutine ? dayRoutine.exercises.length : 0;
                const completedCount = dayRoutine ? dayRoutine.exercises.filter(ex => ex.completed).length : 0;
                const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div 
                    key={day}
                    onClick={() => {
                      setSelectedDay(day);
                      if (dayRoutine) {
                        setActiveRoutineId(dayRoutine.id);
                      }
                    }}
                    className={`relative rounded-3xl overflow-hidden border p-3 flex flex-col justify-between group transition-all duration-500 h-[480px] cursor-pointer shadow-xl ${
                      isSelected 
                        ? 'bg-[#15151a] border-blue-500 shadow-blue-500/10' 
                        : 'bg-[#111114]/80 border-white/5 hover:border-white/10 hover:bg-[#111114]'
                    }`}
                  >
                    {/* Active Day Ribbon overlay */}
                    {isSelected && (
                      <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-blue-400/50 shadow-lg flex items-center gap-1">
                        <Check className="w-3 h-3" strokeWidth={3} /> Active Day
                      </div>
                    )}

                    {/* Expand Poster Button overlay (Top-right) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImage(posterPath);
                      }}
                      className="absolute top-4 right-4 z-10 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl border border-white/10 shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
                      title="Expand 4K Ultra HD Poster"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                    </button>

                    {/* Outer frame image container */}
                    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden shadow-inner border border-white/5">
                      <img 
                        src={posterPath} 
                        alt={`${day} Workout Poster`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none"></div>

                      {/* Sparkles effect */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-300 rounded-full blur-xs animate-ping" style={{ animationDuration: '3s' }}></div>
                        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full blur-xs animate-ping" style={{ animationDuration: '4s' }}></div>
                      </div>

                      {/* Day Name, Workout Title & Quote overlays on top of image */}
                      <div className="absolute bottom-4 left-4 right-4 text-left pointer-events-none">
                        <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest block mb-1">
                          {day}
                        </span>
                        <h4 className="text-sm font-black text-white leading-tight uppercase flex items-center gap-1">
                          {meta.icon.split(' ')[0]} {DAY_WORKOUT_NAMES[day]}
                        </h4>
                        <p className="text-[10px] text-slate-300 italic mt-1 line-clamp-1 font-mono">
                          {meta.quote}
                        </p>
                      </div>
                    </div>

                    {/* Exercises Progress and metadata card */}
                    <div className="mt-3 bg-white/2 border border-white/5 p-3 rounded-2xl flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-2">
                          <span className="uppercase tracking-wider">Drills Assigned</span>
                          <span className="font-mono bg-white/5 px-2 py-0.5 rounded-md text-slate-300">{totalCount} Exercises</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                          {meta.exercises.join(' • ')}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1.5">
                          <span>Progress: {completedCount}/{totalCount} Done</span>
                          <span className="font-mono text-blue-400">{progress}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Active Routine Exercises Manager */}
            <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold text-white">Active Workout List: <span className="text-blue-400">{activeRoutine.name}</span></h3>
                  <p className="text-xs text-slate-500">Add, track, or prune current routine tasks.</p>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg font-mono font-bold">
                  {totalExercises} Exercises Registered
                </span>
              </div>

              <div className="space-y-3">
                {activeRoutine.exercises.map((ex) => (
                  <div key={ex.id} className="p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl flex justify-between items-center transition-all group">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleToggleExercise(ex.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          ex.completed ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {ex.completed && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <p className={`text-sm font-semibold ${ex.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{ex.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Sets: <span className="text-slate-200 font-semibold">{ex.sets}</span> • Reps/Target: <span className="text-slate-200 font-semibold">{ex.reps}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {activeRoutine.exercises.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-12 border border-dashed border-white/5 rounded-2xl">
                    This workout routine is empty. Please add custom exercises using the button above.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 3: NUTRITION & WATER TRACKER
            ----------------------------------------------------------------------- */}
        {activeTab === 'nutrition' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="nutrition-tab">
            
            {/* Column 1: Pixar 3D Poster Showcase (col-span-4) */}
            <div className="lg:col-span-4 bg-[#111114] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white tracking-tight">3D Pixar Poster</h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5" /> Workout Day
                  </span>
                </div>

                {/* Day title prominently at the top */}
                <h2 className="text-base font-black text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
                  {selectedDay} – {DAY_WORKOUT_NAMES[selectedDay]}
                </h2>

                {/* 3D Illustration Container */}
                <div 
                  onClick={() => setLightboxImage(DAY_POSTERS[selectedDay])}
                  className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden cursor-zoom-in border border-white/10 shadow-2xl group/img"
                >
                  <img 
                    src={DAY_POSTERS[selectedDay]} 
                    alt={`${selectedDay} Poster`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none"></div>

                  {/* Dumbbell overlay icon matching the day */}
                  <div className="absolute bottom-4 left-4 p-2 bg-blue-600/90 text-white rounded-xl shadow-lg border border-blue-400/40 backdrop-blur-sm flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-white animate-bounce" style={{ animationDuration: '3s' }} />
                    <span className="text-[10px] font-bold tracking-wider uppercase font-mono">
                      {DAY_WORKOUT_NAMES[selectedDay]}
                    </span>
                  </div>

                  {/* Sparkling effect lights */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-amber-300 rounded-full blur-xs animate-ping" style={{ animationDuration: '2.5s' }}></div>
                    <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-white rounded-full blur-xs animate-ping" style={{ animationDuration: '3.5s' }}></div>
                  </div>

                  {/* Click to expand hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white tracking-wider uppercase font-mono bg-black/60 px-3 py-1.5 rounded-xl border border-white/10">
                      View Ultra HD (4K)
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakfast detailed description of textures / presentation */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                  <Apple className="w-3.5 h-3.5 text-emerald-400" /> Premium Breakfast Selection
                </p>
                <p className="text-xs text-slate-400 font-medium leading-relaxed bg-white/2 p-3 rounded-xl border border-white/5 font-mono">
                  {getBreakfastDescription(selectedDay)}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
                  <span>Banana Leaf Style</span>
                  <span>Glossy Morning Ray</span>
                </div>
              </div>
            </div>
            
            {/* Column 2: Macro Nutrients Progress (col-span-4) */}
            <div className="lg:col-span-4 bg-[#111114] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white mb-1.5">Macro Intake Goal Tracker</h3>
                  <p className="text-xs text-slate-400">Track daily target levels against logged meals.</p>
                </div>

                <div className="space-y-5">
                  {/* Calorie Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Calories Consumed</span>
                      <span className="font-mono">{totalCaloriesConsumed} / {profile.dailyCalorieGoal} kcal</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((totalCaloriesConsumed / profile.dailyCalorieGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Protein Goal (Estimate based on meal completion) */}
                  {(() => {
                    const totalProteinGoal = 150; // grams
                    const proteinCalculated = meals.reduce((sum, m) => {
                      if (!m.completed) return sum;
                      if (m.name.includes('Breakfast')) return sum + 32;
                      if (m.name === 'Lunch') return sum + 48;
                      if (m.name === 'Dinner') return sum + 40;
                      return sum + Math.round(m.calories * 0.05); // Estimate 5% calories in custom snack is protein
                    }, 0);

                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">Protein Target</span>
                          <span className="font-mono text-green-400">{proteinCalculated}g / {totalProteinGoal}g</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((proteinCalculated / totalProteinGoal) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Carbohydrates Goal */}
                  {(() => {
                    const carbGoal = 220; // grams
                    const carbsCalculated = meals.reduce((sum, m) => {
                      if (!m.completed) return sum;
                      if (m.name.includes('Breakfast')) return sum + 50;
                      if (m.name === 'Lunch') return sum + 65;
                      if (m.name === 'Dinner') return sum + 30;
                      return sum + Math.round(m.calories * 0.12);
                    }, 0);

                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">Carbohydrates Target</span>
                          <span className="font-mono text-amber-500">{carbsCalculated}g / {carbGoal}g</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((carbsCalculated / carbGoal) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Fats Goal */}
                  {(() => {
                    const fatGoal = 70; // grams
                    const fatsCalculated = meals.reduce((sum, m) => {
                      if (!m.completed) return sum;
                      if (m.name.includes('Breakfast')) return sum + 12;
                      if (m.name === 'Lunch') return sum + 16;
                      if (m.name === 'Dinner') return sum + 10;
                      return sum + Math.round(m.calories * 0.03);
                    }, 0);

                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">Fats Target</span>
                          <span className="font-mono text-purple-500">{fatsCalculated}g / {fatGoal}g</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min((fatsCalculated / fatGoal) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Quick weight indicators */}
              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Current Weight</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{profile.currentWeight} kg</p>
                </div>
                <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target Weight</p>
                  <p className="text-base font-bold text-blue-400 font-mono mt-0.5">{profile.weightGoal} kg</p>
                </div>
              </div>
            </div>

            {/* Column 3: Dynamic Glass Water Tracker (col-span-4) */}
            <div className="lg:col-span-4 bg-[#111114] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-white">Hydration Tracker</h3>
                    <p className="text-xs text-slate-400">Track and meet your 3.0L daily hydration goal.</p>
                  </div>
                  <button 
                    onClick={handleResetWater}
                    className="p-1.5 bg-white/5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 border border-white/5 transition-all text-xs flex items-center gap-1"
                    title="Reset Water Progress"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
                
                <p className="text-2xl font-extrabold text-blue-400 font-mono tracking-tight mt-3">
                  {waterIntake} <span className="text-xs text-slate-500 font-normal">/ {waterTarget} ml</span>
                </p>
              </div>

              {/* Visual Cup container with wave fluid filling animation */}
              <div className="relative w-36 h-48 bg-slate-900 border-4 border-slate-700/60 rounded-b-3xl rounded-t-lg mx-auto my-4 overflow-hidden flex flex-col justify-end shadow-2xl">
                {/* Wave Filler */}
                <div 
                  className="bg-blue-600/70 border-t-2 border-blue-400/90 w-full transition-all duration-700 relative flex items-center justify-center text-white" 
                  style={{ height: `${Math.min((waterIntake / waterTarget) * 100, 100)}%` }}
                >
                  {waterIntake > 0 && (
                    <span className="absolute text-xs font-extrabold font-mono drop-shadow animate-pulse">
                      {Math.round((waterIntake / waterTarget) * 100)}%
                    </span>
                  )}
                </div>

                {/* Grid measurement marks */}
                <div className="absolute inset-y-0 left-3 flex flex-col justify-between py-4 text-[9px] text-slate-500 font-mono pointer-events-none select-none">
                  <span>3.0L</span>
                  <span>2.25L</span>
                  <span>1.5L</span>
                  <span>0.75L</span>
                </div>
              </div>

              {/* Log Presets Button Row */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAddWater(250)}
                    className="flex-1 py-3 bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/20 rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 hover:scale-103"
                  >
                    <Droplet className="w-3.5 h-3.5 shrink-0" />
                    +250ml
                  </button>
                  <button 
                    onClick={() => handleAddWater(500)}
                    className="flex-1 py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 hover:scale-103"
                  >
                    <Droplet className="w-3.5 h-3.5 shrink-0" />
                    +500ml
                  </button>
                </div>
                <p className="text-center text-[9px] text-slate-500">Suggested intervals: every 2 hours.</p>
              </div>
            </div>

          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 4: HISTORICAL LOGS
            ----------------------------------------------------------------------- */}
        {activeTab === 'history' && (
          <div className="space-y-6" id="history-tab">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Activity History Logs</h2>
                <p className="text-xs text-slate-400">Review your past log events, daily logs, and achievements.</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Reset local history logs?")) {
                    setHistoryLogs([]);
                    localStorage.removeItem('pulsefit_history');
                  }
                }}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
              >
                Clear History
              </button>
            </div>

            <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-white/5">
                
                {historyLogs.map((log) => {
                  let badgeColor = 'bg-slate-500/20 text-slate-400 border-slate-500/10';
                  let logIcon = <Calendar className="w-4 h-4" />;

                  if (log.type === 'workout') {
                    badgeColor = 'bg-green-500/20 text-green-400 border-green-500/10';
                    logIcon = <Dumbbell className="w-4 h-4" />;
                  } else if (log.type === 'diet') {
                    badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/10';
                    logIcon = <Utensils className="w-4 h-4" />;
                  } else if (log.type === 'water') {
                    badgeColor = 'bg-sky-500/20 text-sky-400 border-sky-500/10';
                    logIcon = <Droplet className="w-4 h-4" />;
                  } else if (log.type === 'streak') {
                    badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/10';
                    logIcon = <Flame className="w-4 h-4" />;
                  }

                  return (
                    <div key={log.id} className="relative flex gap-6 items-start group">
                      {/* Left icon node */}
                      <div className="w-12 h-12 rounded-xl bg-[#1a1a1f] border border-white/10 flex items-center justify-center text-slate-300 z-10 shrink-0 group-hover:scale-105 transition-transform">
                        {logIcon}
                      </div>

                      {/* Right timeline detail card */}
                      <div className="flex-1 p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl transition-all">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{log.title}</h4>
                            <p className="text-xs text-slate-400 mt-1">{log.description}</p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border self-start ${badgeColor}`}>
                            {log.type}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5 text-[10px] text-slate-500 font-medium font-mono">
                          <span>{log.timestamp}</span>
                          {log.caloriesBurned && <span className="text-green-400 font-bold">🔥 -{log.caloriesBurned} kcal burned</span>}
                          {log.calories && <span className="text-blue-400 font-bold">🥗 +{log.calories} kcal consumed</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {historyLogs.length === 0 && (
                  <div className="text-center py-16 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-600 animate-bounce" />
                    <p className="text-sm font-medium">No activity history recorded yet.</p>
                    <p className="text-xs text-slate-600 mt-1">Activities will log automatically as you progress.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* -----------------------------------------------------------------------
          MODAL 1: ADD MEAL OVERLAY
          ----------------------------------------------------------------------- */}
      {showAddMealModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="add-meal-modal">
          <div className="bg-[#111114] border border-white/15 rounded-3xl p-6 w-full max-w-md relative shadow-2xl animate-scale-up">
            <button 
              onClick={() => setShowAddMealModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add Custom Daily Meal</h3>
            <p className="text-xs text-slate-400 mb-5">Record nutrition data instantly for precision calibration.</p>

            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Meal Name</label>
                <input 
                  type="text" 
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder="e.g. Avocado Toast, Protein Shake"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Calories (kcal)</label>
                  <input 
                    type="number" 
                    value={newMealCalories}
                    onChange={(e) => setNewMealCalories(e.target.value)}
                    placeholder="350"
                    required
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Meal Type</label>
                  <select 
                    value={newMealType}
                    onChange={(e: any) => setNewMealType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Breakfast" className="bg-slate-900">Breakfast</option>
                    <option value="Lunch" className="bg-slate-900">Lunch</option>
                    <option value="Dinner" className="bg-slate-900">Dinner</option>
                    <option value="Snack" className="bg-slate-900">Snack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Short Description</label>
                <input 
                  type="text" 
                  value={newMealDesc}
                  onChange={(e) => setNewMealDesc(e.target.value)}
                  placeholder="e.g. Whole wheat bread with extra protein"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Emoji Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Representative Emoji Icon</label>
                <div className="flex gap-2.5 flex-wrap pt-1">
                  {['🥑', '🍎', '🥩', '🍳', '🥣', '🥗', '🥤', '🍞', '🐟'].map(emoji => (
                    <button 
                      type="button"
                      key={emoji}
                      onClick={() => setNewMealEmoji(emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                        newMealEmoji === emoji 
                          ? 'bg-blue-600/20 border-blue-500 text-white scale-105' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 mt-6 active:scale-98"
              >
                <Plus className="w-4 h-4" /> SAVE DIETARY ENTRY
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL 2: ADD EXERCISE OVERLAY
          ----------------------------------------------------------------------- */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="add-exercise-modal">
          <div className="bg-[#111114] border border-white/15 rounded-3xl p-6 w-full max-w-md relative shadow-2xl animate-scale-up">
            <button 
              onClick={() => setShowAddExerciseModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Add Exercise Routine Drills</h3>
            <p className="text-xs text-slate-400 mb-5">Append drills directly inside your active <span className="text-blue-400 font-semibold">{activeRoutine.name}</span> routine.</p>

            <form onSubmit={handleAddExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Exercise Name</label>
                <input 
                  type="text" 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Incline Bench Press, Leg Curls"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sets Target</label>
                  <input 
                    type="text" 
                    value={newExSets}
                    onChange={(e) => setNewExSets(e.target.value)}
                    placeholder="4"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reps Target</label>
                  <input 
                    type="text" 
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    placeholder="10 or Failure"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 mt-6 active:scale-98"
              >
                <Plus className="w-4 h-4" /> APPEND EXERCISE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL 3: PROFILE CUSTOMIZATION OVERLAY
          ----------------------------------------------------------------------- */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="profile-modal">
          <div className="bg-[#111114] border border-white/15 rounded-3xl p-6 w-full max-w-md relative shadow-2xl animate-scale-up">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Customize Member Parameters</h3>
            <p className="text-xs text-slate-400 mb-5">Recalibrate target objectives, goal metrics, and preferences.</p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Athlete Name</label>
                <input 
                  type="text" 
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  placeholder="Abinaya"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Short Name / Nickname</label>
                <input 
                  type="text" 
                  value={editProfileNickname}
                  onChange={(e) => setEditProfileNickname(e.target.value)}
                  placeholder="abi"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Daily Caloric Ceiling Limit (kcal)</label>
                <input 
                  type="number" 
                  value={editProfileCalorieGoal}
                  onChange={(e) => setEditProfileCalorieGoal(e.target.value)}
                  placeholder="2000"
                  required
                  min="500"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Current Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editProfileWeight}
                    onChange={(e) => setEditProfileWeight(e.target.value)}
                    placeholder="82"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Weight Goal (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={editProfileGoalWeight}
                    onChange={(e) => setEditProfileGoalWeight(e.target.value)}
                    placeholder="78"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Select Profile Design Theme */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Avatar Style Palette</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'from-purple-500 to-pink-500', label: 'Sunset Glow' },
                    { key: 'from-blue-600 to-indigo-700', label: 'Ocean Depth' },
                    { key: 'from-emerald-500 to-teal-600', label: 'Forest Mint' },
                  ].map((p) => (
                    <button 
                      type="button"
                      key={p.key}
                      onClick={() => setProfile((prev: any) => ({ ...prev, avatarGradient: p.key }))}
                      className={`p-2.5 rounded-xl text-[10px] font-bold text-center border transition-all ${
                        profile.avatarGradient === p.key 
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${p.key} mx-auto mb-1`}></div>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 mt-6 active:scale-98"
              >
                <Check className="w-4 h-4" /> UPDATE PREFERENCES
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL 4: CELEBRATION MODAL (WORKOUT COMPLETION SUCCESS)
          ----------------------------------------------------------------------- */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="celebration-modal">
          <div className="bg-gradient-to-b from-[#16161c] to-[#0d0d10] border border-yellow-500/30 rounded-3xl p-8 w-full max-w-sm text-center relative shadow-2xl shadow-yellow-500/10 animate-scale-up">
            
            {/* Animated Floating Confetti Emojis */}
            <div className="absolute -top-10 left-1/4 animate-bounce text-2xl" style={{ animationDelay: '0.1s' }}>🎉</div>
            <div className="absolute -top-6 right-1/4 animate-bounce text-2xl" style={{ animationDelay: '0.4s' }}>🔥</div>
            <div className="absolute top-1/2 -left-8 animate-pulse text-2xl">💪</div>
            <div className="absolute top-1/3 -right-8 animate-pulse text-2xl">🏆</div>

            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-yellow-500/20">
              <Award className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Outstanding Work, Champ!</h3>
            <p className="text-sm text-yellow-400 font-semibold mb-4 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" /> Daily Streak Extended to {streak} Days!
            </p>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              You completed the <span className="text-blue-400 font-semibold">{activeRoutine.name}</span> routine flawlessly. Calorie burn recorded, metrics archived, and hydration tracking preserved. Keep pushing!
            </p>

            <button 
              onClick={() => setShowCelebrationModal(false)}
              className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 transition-colors text-[#0c0c0f] font-extrabold rounded-2xl shadow-xl shadow-yellow-900/30 text-xs tracking-wider uppercase"
            >
              DISMISS & TRACK MORE
            </button>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MODAL 5: ULTRA HD (4K) FOOD POSTER LIGHTBOX
          ----------------------------------------------------------------------- */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          id="poster-lightbox-modal"
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 border border-white/10 shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-md w-full bg-slate-950 border border-white/10 rounded-3xl p-5 flex flex-col items-center shadow-2xl relative animate-scale-up"
          >
            {/* Dumbbell overlay inside Lightbox */}
            <div className="absolute top-8 left-8 p-2.5 bg-blue-600 text-white rounded-2xl shadow-xl border border-blue-400/50 flex items-center gap-2 z-10 animate-pulse">
              <Dumbbell className="w-4.5 h-4.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{DAY_WORKOUT_NAMES[selectedDay]}</span>
            </div>

            {/* Glowing Day Title */}
            <div className="text-center mb-4 pt-4">
              <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center justify-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                {selectedDay} Meal Poster
              </h3>
              <p className="text-[10px] text-blue-400 font-bold mt-1 uppercase tracking-widest">{DAY_WORKOUT_NAMES[selectedDay]}</p>
            </div>

            {/* Poster image */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <img 
                src={lightboxImage} 
                alt="Enlarged Pixar Poster" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              {/* Sparkle effects */}
              <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-amber-200 rounded-full blur-xs animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-blue-300 rounded-full blur-xs animate-ping" style={{ animationDuration: '3s' }}></div>
            </div>

            {/* Food text description */}
            <div className="mt-4 w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Pixar 3D Premium Illustration</p>
              <p className="text-xs font-semibold text-white tracking-tight leading-relaxed">{getBreakfastDescription(selectedDay)}</p>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">Ultra HD (4K) • Realistic food textures • Cinematic warm lighting • Banana leaf presentation</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
