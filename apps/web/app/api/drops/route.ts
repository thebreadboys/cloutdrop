import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const body = await request.json()
    
    // Validate required fields (matches launch-form.tsx lines 44-57)
    const requiredFields = [
      'contractAddress', 'coinName', 'coinTicker', 
      'airdropAmount', 'solAmount', 'weights', 'walletAddress'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return new NextResponse(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers
        })
      }
    }

    // Validate wallet address format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(body.walletAddress)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid wallet address format' }), {
        status: 400,
        headers
      })
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('drops')
      .insert([{
        contract_address: body.contractAddress,
        token_name: body.coinName,
        token_ticker: body.coinTicker,
        airdrop_amount: body.airdropAmount,
        sol_amount: body.solAmount,
        distribution_weights: body.weights,
        wallet_address: body.walletAddress,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) throw error

    return NextResponse.json({ data }, { headers })

  } catch (error) {
    console.error('Error creating drop:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to create drop', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers
    })
  }
} 