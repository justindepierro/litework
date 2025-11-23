#!/usr/bin/env node
/**
 * Check for pending/hanging invites in the database
 * Shows all invites with status 'pending' or 'draft'
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPendingInvites() {
  console.log('🔍 Checking ALL invites in database (including deleted)...\n');

  try {
    // Get ALL invites regardless of status (including soft-deleted)
    const { data: allInvites, error: allError } = await supabase
      .from('invites')
      .select('id, email, first_name, last_name, status, expires_at, created_at, deleted_at, accepted_at')
      .order('created_at', { ascending: false });

    if (allError) throw allError;

    console.log(`📊 TOTAL INVITES IN DATABASE: ${allInvites?.length || 0}\n`);

    if (!allInvites || allInvites.length === 0) {
      console.log('✅ No invites found in database.');
      return;
    }

    // Separate by status
    const pendingActive = allInvites.filter(i => (i.status === 'pending' || i.status === 'draft') && !i.deleted_at);
    const softDeletedInvites = allInvites.filter(i => i.deleted_at);
    const acceptedInvites = allInvites.filter(i => i.status === 'accepted' || i.accepted_at);
    const cancelledInvites = allInvites.filter(i => i.status === 'cancelled' && !i.deleted_at);
    const expiredInvites = allInvites.filter(i => i.expires_at && new Date(i.expires_at) < new Date() && !i.deleted_at && i.status === 'pending');

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`📌 PENDING/DRAFT (active): ${pendingActive.length}`);
    console.log(`✅ ACCEPTED: ${acceptedInvites.length}`);
    console.log(`❌ CANCELLED: ${cancelledInvites.length}`);
    console.log(`🗑️  SOFT-DELETED: ${softDeletedInvites.length}`);
    console.log(`⏰ EXPIRED (not deleted): ${expiredInvites.length}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Show active invites
    if (pendingActive.length > 0) {
      console.log('📋 ACTIVE PENDING/DRAFT INVITES:\n');
      pendingActive.forEach((invite, index) => {
        const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();
        const daysSinceCreated = Math.floor((new Date() - new Date(invite.created_at)) / (1000 * 60 * 60 * 24));
        
        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email || '(draft - no email)'}`);
        console.log(`   Status: ${invite.status} ${isExpired ? '⚠️ EXPIRED' : '✅ Active'}`);
        console.log(`   Created: ${new Date(invite.created_at).toLocaleDateString()} (${daysSinceCreated} days ago)`);
        if (invite.expires_at) {
          console.log(`   Expires: ${new Date(invite.expires_at).toLocaleDateString()}`);
        }
        console.log(`   ID: ${invite.id}\n`);
      });
    }

    // Show accepted invites
    if (acceptedInvites.length > 0) {
      console.log('\n✅ ACCEPTED INVITES (successfully registered):\n');
      acceptedInvites.forEach((invite, index) => {
        const daysSinceAccepted = invite.accepted_at ? Math.floor((new Date() - new Date(invite.accepted_at)) / (1000 * 60 * 60 * 24)) : null;
        
        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email}`);
        console.log(`   Status: ${invite.status}`);
        if (invite.accepted_at) {
          console.log(`   Accepted: ${new Date(invite.accepted_at).toLocaleDateString()} (${daysSinceAccepted} days ago)`);
        }
        console.log(`   ID: ${invite.id}\n`);
      });
    }

    // Show cancelled invites
    if (cancelledInvites.length > 0) {
      console.log('\n❌ CANCELLED INVITES:\n');
      cancelledInvites.forEach((invite, index) => {
        const daysSinceCreated = Math.floor((new Date() - new Date(invite.created_at)) / (1000 * 60 * 60 * 24));
        
        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email || '(no email)'}`);
        console.log(`   Status: cancelled`);
        console.log(`   Created: ${new Date(invite.created_at).toLocaleDateString()} (${daysSinceCreated} days ago)`);
        console.log(`   ID: ${invite.id}\n`);
      });
    }

    // Show soft-deleted invites (THE ONES YOU WANT TO RECOVER!)
    if (softDeletedInvites.length > 0) {
      console.log('\n🗑️  SOFT-DELETED INVITES (can be recovered!):\n');
      softDeletedInvites.forEach((invite, index) => {
        const daysSinceDeleted = Math.floor((new Date() - new Date(invite.deleted_at)) / (1000 * 60 * 60 * 24));
        const daysSinceCreated = Math.floor((new Date() - new Date(invite.created_at)) / (1000 * 60 * 60 * 24));
        
        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email || '(draft - no email)'}`);
        console.log(`   Status: ${invite.status}`);
        console.log(`   Created: ${new Date(invite.created_at).toLocaleDateString()} (${daysSinceCreated} days ago)`);
        console.log(`   Deleted: ${new Date(invite.deleted_at).toLocaleDateString()} (${daysSinceDeleted} days ago)`);
        console.log(`   ID: ${invite.id}`);
        console.log(`   💡 Can be recovered by setting deleted_at = NULL\n`);
      });
      console.log(`\n🔧 To recover these invites, run the recovery script with their IDs.\n`);
    }

    // Show expired invites that need cleanup
    if (expiredInvites.length > 0) {
      console.log('\n⚠️  EXPIRED INVITES (candidates for next cleanup run):\n');
      expiredInvites.forEach((invite, index) => {
        const daysSinceExpired = Math.floor((new Date() - new Date(invite.expires_at)) / (1000 * 60 * 60 * 24));
        
        console.log(`${index + 1}. ${invite.first_name} ${invite.last_name}`);
        console.log(`   Email: ${invite.email}`);
        console.log(`   Expired: ${new Date(invite.expires_at).toLocaleDateString()} (${daysSinceExpired} days ago)`);
        console.log(`   ID: ${invite.id}\n`);
      });
      console.log(`💡 These ${expiredInvites.length} invites will be soft-deleted in next cleanup run (daily at 2 AM)\n`);
    }

  } catch (error) {
    console.error('❌ Error checking invites:', error);
    process.exit(1);
  }
}

checkPendingInvites();
