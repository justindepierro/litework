import { NextRequest, NextResponse } from 'next/server';
import { supabaseApiClient } from '@/lib/supabase-client';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const result = await supabaseApiClient.deleteAthlete(id);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { deleted: true }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting athlete:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete athlete'
    }, { status: 500 });
  }
}