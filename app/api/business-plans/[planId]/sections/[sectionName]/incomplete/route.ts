import { NextRequest, NextResponse } from 'next/server'
import { markBusinessPlanSectionIncomplete } from '@/lib/airtable-user'

export async function POST(
  request: NextRequest,
  { params }: { params: { planId: string; sectionName: string } }
) {
  try {
    const { planId, sectionName } = params
    const body = await request.json()
    const { completedBy } = body

    // Get user email from request headers or body
    const userEmail = request.headers.get('x-user-email') || completedBy || 'demo@example.com'

    const sectionData = {
      planId,
      sectionName,
      completedBy: userEmail,
      completedAt: new Date().toISOString(),
    }

    const result = await markBusinessPlanSectionIncomplete(sectionData, userEmail)

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Section marked as incomplete successfully',
        section: result.section 
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          errorType: result.errorType,
          troubleshooting: result.troubleshooting,
          errorId: result.errorId
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in incomplete route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        errorType: 'server_error',
        troubleshooting: [
          'Check server logs for detailed error information',
          'Verify API route is properly configured',
          'Ensure request body contains required fields'
        ]
      },
      { status: 500 }
    )
  }
}
