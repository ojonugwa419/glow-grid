import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.0/index.ts';

const CONTRACT_NAME = 'user_profile';

// Helper function to create a valid profile
function createValidProfile(chain: Chain, sender: Account) {
  return chain.mineBlock([
    Tx.contractCall(
      CONTRACT_NAME, 
      'create-profile', 
      [
        types.utf8('testuser'),
        types.utf8('oily'),
        types.list([types.utf8('reduce acne'), types.utf8('moisturize')])
      ], 
      sender.address
    )
  ]);
}

Clarinet.test({
  name: "Profile Creation: Successfully create profile with valid data",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = createValidProfile(chain, deployer);
    
    // Verify transaction success
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify profile exists
    const profileCheck = chain.callReadOnlyFn(
      CONTRACT_NAME, 
      'profile-exists', 
      [types.principal(deployer.address)], 
      deployer.address
    );
    profileCheck.result.expectBool(true);
  }
});

Clarinet.test({
  name: "Profile Creation: Prevent duplicate profile creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Create first profile
    createValidProfile(chain, deployer);
    
    // Try to create profile again
    const block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'create-profile', 
        [
          types.utf8('testuser2'),
          types.utf8('dry'),
          types.list([types.utf8('hydration'), types.utf8('glow')])
        ], 
        deployer.address
      )
    ]);
    
    // Verify error for duplicate profile
    block.receipts[0].result.expectErr().expectUint(409); // ERR_PROFILE_ALREADY_EXISTS
  }
});

Clarinet.test({
  name: "Profile Creation: Validate input constraints",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Test empty username
    const emptyUsernameBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'create-profile', 
        [
          types.utf8(''),
          types.utf8('oily'),
          types.list([types.utf8('reduce acne')])
        ], 
        deployer.address
      )
    ]);
    emptyUsernameBlock.receipts[0].result.expectErr().expectUint(400); // ERR_INVALID_INPUT
    
    // Test too many skincare goals
    const tooManyGoalsBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'create-profile', 
        [
          types.utf8('testuser'),
          types.utf8('oily'),
          types.list([
            types.utf8('goal1'), 
            types.utf8('goal2'), 
            types.utf8('goal3'), 
            types.utf8('goal4'), 
            types.utf8('goal5'), 
            types.utf8('goal6')
          ])
        ], 
        deployer.address
      )
    ]);
    tooManyGoalsBlock.receipts[0].result.expectErr().expectUint(400); // ERR_INVALID_INPUT
  }
});

Clarinet.test({
  name: "Profile Update: Allow profile updates by owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Create initial profile
    createValidProfile(chain, deployer);
    
    // Update profile
    const block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'update-profile', 
        [
          types.some(types.utf8('newusername')),
          types.some(types.utf8('combination')),
          types.some(types.list([types.utf8('new goal')]))
        ], 
        deployer.address
      )
    ]);
    
    // Verify update success
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify updated profile info
    const profileInfo = chain.callReadOnlyFn(
      CONTRACT_NAME, 
      'get-profile-info', 
      [types.principal(deployer.address)], 
      deployer.address
    );
    
    // Note: You might want to add more specific assertions about the updated values
  }
});

Clarinet.test({
  name: "Privacy Mode: Toggle and verify access restrictions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const alice = accounts.get('wallet_1')!;
    
    // Create profile
    createValidProfile(chain, deployer);
    
    // Set to public mode
    const publicModeBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'set-privacy-mode', 
        [types.uint(1)], // PRIVACY_PUBLIC
        deployer.address
      )
    ]);
    publicModeBlock.receipts[0].result.expectOk().expectBool(true);
    
    // Try to retrieve profile as another user (should succeed)
    const publicProfileAccess = chain.callReadOnlyFn(
      CONTRACT_NAME, 
      'get-profile-info', 
      [types.principal(deployer.address)], 
      alice.address
    );
    publicProfileAccess.result.expectOk();
    
    // Set back to private mode
    const privateModeBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'set-privacy-mode', 
        [types.uint(2)], // PRIVACY_PRIVATE
        deployer.address
      )
    ]);
    privateModeBlock.receipts[0].result.expectOk().expectBool(true);
    
    // Try to retrieve profile as another user (should fail)
    const privateProfileAccess = chain.callReadOnlyFn(
      CONTRACT_NAME, 
      'get-profile-info', 
      [types.principal(deployer.address)], 
      alice.address
    );
    privateProfileAccess.result.expectErr().expectUint(403); // ERR_UNAUTHORIZED
  }
});

Clarinet.test({
  name: "Profile Deletion: Allow owner to delete profile",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    // Create profile
    createValidProfile(chain, deployer);
    
    // Delete profile
    const block = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'delete-profile', 
        [], 
        deployer.address
      )
    ]);
    
    // Verify deletion success
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify profile no longer exists
    const profileCheck = chain.callReadOnlyFn(
      CONTRACT_NAME, 
      'profile-exists', 
      [types.principal(deployer.address)], 
      deployer.address
    );
    profileCheck.result.expectBool(false);
  }
});

Clarinet.test({
  name: "Access Control: Block unauthorized profile operations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const alice = accounts.get('wallet_1')!;
    
    // Create profile
    createValidProfile(chain, deployer);
    
    // Alice tries to update deployer's profile
    const updateBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'update-profile', 
        [
          types.some(types.utf8('hacked-username')),
          types.none(),
          types.none()
        ], 
        alice.address
      )
    ]);
    updateBlock.receipts[0].result.expectErr(); // Should fail with unauthorized error
    
    // Alice tries to delete deployer's profile
    const deleteBlock = chain.mineBlock([
      Tx.contractCall(
        CONTRACT_NAME, 
        'delete-profile', 
        [], 
        alice.address
      )
    ]);
    deleteBlock.receipts[0].result.expectErr(); // Should fail with profile not found or unauthorized
  }
});