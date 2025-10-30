import { NextRequest, NextResponse } from 'next/server';
import { supabaseApiClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { athleteId, exerciseId, exerciseName, currentPR, dateAchieved } = body;
    
    if (!athleteId || !exerciseId || !exerciseName || !currentPR || !dateAchieved) {
      return NextResponse.json({
        success: false,
        error: 'All KPI fields are required'
      }, { status: 400 });
    }
    
    const result = await supabaseApiClient.createKPI({
      athleteId,
      exerciseId,
      exerciseName,
      currentPR: parseFloat(currentPR),
      dateAchieved: new Date(dateAchieved),
      isActive: true
    });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { kpi: result.data }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating KPI:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create KPI'
    }, { status: 500 });
  }
}