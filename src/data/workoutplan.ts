export type Exercise = {
    id: string;
    name: string;
    sets: number;
    reps: string;
    notes: string;
};

export type WorkoutDay = {
    id: string;
    day: string;
    title: string;
    focus: string;
    exercises: Exercise[];
};

export const workoutPlan: WorkoutDay[] = [
    {
        id: "pull_day",
        day: "Monday / Thursday",
        title: "Heavy Pull & Table Strength",
        focus: "Back, Biceps, Arm Wrestling",
        exercises: [
            { id: "p1", name: "Weighted Pull-Ups", sets: 2, reps: "5-6", notes: "Set 1: +10kg (leave 1 rep in tank). Set 2: +15kg to absolute failure." },
            { id: "p2", name: "Dumbbell Rows", sets: 2, reps: "7-8", notes: "Start with Left Arm. Match the exact reps with Right Arm. (Current: 25kg)" },
            { id: "p3", name: "Rack Pulls", sets: 3, reps: "6", notes: "Warm up 60kg -> 100kg. Top working set: 120kg. Protect lower back." },
            { id: "p4", name: "EZ Bar Bicep Curls", sets: 2, reps: "7-8", notes: "Heavy. (Current: 12.5kg each side)." },
            { id: "p5", name: "Arm Wrestling Specific (Dropdown)", sets: 2, reps: "5-8", notes: "Option 1: Hook (Heavy cable curls). Option 2: Riser (Cable hammer curls with static hold on last rep)." }
        ]
    },
    {
        id: "push_day",
        day: "Tuesday / Friday",
        title: "Heavy Push & Pressing Power",
        focus: "Chest, Shoulders, Triceps",
        exercises: [
            { id: "pu1", name: "Incline Barbell Bench (or Flat)", sets: 2, reps: "3-5", notes: "Warm up with external/internal rotations + pushups. Top set: 15kg plates each side." },
            { id: "pu2", name: "Weighted Dips", sets: 2, reps: "2-3", notes: "Hit these while shoulders are fresh! Prioritize stability and heavy weight." },
            { id: "pu3", name: "Incline Dumbbell Press", sets: 2, reps: "7", notes: "Deep stretch at the bottom. (Current: 20kg, aiming for 22.5kg)." },
            { id: "pu4", name: "Cable Lateral Raises", sets: 2, reps: "6-11", notes: "If cable taken, use seated dumbbells. 5kg x 11 -> 7.5kg x 7." },
            { id: "pu5", name: "Cable Tricep Extensions", sets: 2, reps: "Failure", notes: "AUTO-REGULATE: Only do this if CNS is firing and you feel energetic. (40kg+)." }
        ]
    },
    {
        id: "leg_day",
        day: "Wednesday / Saturday",
        title: "Atomic Leg Day",
        focus: "Quads, Hamstrings, Abs",
        exercises: [
            { id: "l1", name: "Hack Squats", sets: 2, reps: "Failure", notes: "The atomic bomb for quads. Keep lower back pinned to the pad." },
            { id: "l2", name: "Dumbbell RDLs", sets: 2, reps: "8-10", notes: "CRITICAL: Added for hamstring and glute thickness. Heavy stretch." },
            { id: "l3", name: "Leg Extensions", sets: 2, reps: "Failure", notes: "Burn out the quads completely." },
            { id: "l4", name: "Seated Leg Curls", sets: 2, reps: "9-12", notes: "Heavy constant tension." },
            { id: "l5", name: "Standing Cable Side-Kicks", sets: 2, reps: "10-12", notes: "Replaces broken abductor machine. Strap to ankle, kick outward." },
            { id: "l6", name: "Weighted Ab Crunch Machine", sets: 2, reps: "Failure", notes: "Round the spine, contract hard. Treat abs like heavy compounds." }
        ]
    }
];