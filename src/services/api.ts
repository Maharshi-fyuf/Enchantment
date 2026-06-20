import sql from '../lib/db';

export const getActivities = async () => {
  try {
    const result = await sql`
      SELECT a.*, u.username as user 
      FROM activities a 
      LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.created_at DESC 
      LIMIT 20
    `;
    return result;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

export const logActivity = async (activityData: any) => {
  try {
    const { type, distance, pace, workout_focus, total_volume, duration, notes, user_id } = activityData;
    // We mock the user_id since we don't have auth yet, but ideally this comes from a real user context.
    const mockUserId = '00000000-0000-0000-0000-000000000000'; // We will handle this gracefully if the schema requires it.
    
    const result = await sql`
      INSERT INTO activities (user_id, type, distance, pace, workout_focus, total_volume, duration, notes)
      VALUES (${user_id || mockUserId}, ${type.toLowerCase()}, ${distance || null}, ${pace || null}, ${workout_focus || null}, ${total_volume || null}, ${duration || null}, ${notes || null})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

export const getStudyProgress = async () => {
  // Placeholder for real study progress integration
  return [];
};
