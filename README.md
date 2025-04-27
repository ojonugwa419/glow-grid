# GlowGrid - Secure User Profiles for Beauty Apps

## Project Overview
GlowGrid is a blockchain infrastructure project that provides secure user profiles, tutorial management, and engagement rewards for a personalized beauty app. The key features of the project include:

- **Secure User Profiles**: Blockchain-backed user profiles with privacy-focused design, allowing users to control their personal information and privacy settings.
- **Tutorial Management**: Capabilities to create, distribute, and track educational content for the app's users.
- **Engagement Rewards**: A rewards system that incentivizes user participation and content engagement.

## Contract Architecture

The core component of the GlowGrid project is the `user_profile.clar` Clarity smart contract, which manages the secure user profiles. The contract provides the following functionality:

**User Profile Data Structure**:
- Stores user information such as username, skin type, skincare goals, privacy mode, and profile creation status in a `user-profiles` map.

**Profile Creation and Updates**:
- Allows users to create new profiles with a username, skin type, and skincare goals.
- Enables users to update their profile information, including username, skin type, and skincare goals.

**Privacy Mode Management**:
- Allows users to set their profile's privacy mode to either public or private.
- Respects the user's privacy mode when retrieving profile information.

**Profile Deletion**:
- Enables users to delete their profile.

**Access Control**:
- Enforces that users can only perform operations on their own profiles.
- Provides various error codes to handle different error scenarios, such as unauthorized access, profile not found, and invalid input.

The contract also includes a comprehensive test suite in `user_profile_test.ts` that validates the key functionality, including profile creation, updates, privacy mode changes, and deletion.

## Installation & Setup

Prerequisites:
- Clarinet, a Clarity smart contract testing and deployment tool

Installation steps:
1. Clone the GlowGrid repository: `git clone https://github.com/username/glow-grid.git`
2. Navigate to the project directory: `cd glow-grid`
3. Install dependencies: `clarinet install`

Configuration:
The project includes Clarinet configuration files for different environments (Devnet, Mainnet, Testnet) in the `settings/` directory. Update these files as needed to configure your deployment environment.

## Usage Guide

**Creating a User Profile**:
```clarity
(contract-call? 'user_profile 'create-profile
  (tuple (username "testuser") (skin-type "oily") (skincare-goals (list "reduce acne" "moisturize"))))
```

**Updating a User Profile**:
```clarity
(contract-call? 'user_profile 'update-profile
  (some "newusername") (some "combination") (some (list "new goal")))
```

**Setting Privacy Mode**:
```clarity
(contract-call? 'user_profile 'set-privacy-mode (uint 1)) ; PRIVACY_PUBLIC
(contract-call? 'user_profile 'set-privacy-mode (uint 2)) ; PRIVACY_PRIVATE
```

**Deleting a User Profile**:
```clarity
(contract-call? 'user_profile 'delete-profile)
```

**Retrieving Profile Information**:
```clarity
(contract-call? 'user_profile 'get-profile-info (as-principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM))
```

## Testing

The project includes a comprehensive test suite for the `user_profile.clar` contract, located in the `tests/` directory. The test suite covers the following key scenarios:

- Successful profile creation with valid data
- Preventing duplicate profile creation
- Validating input constraints
- Allowing profile updates by the owner
- Toggling privacy mode and verifying access restrictions
- Allowing profile deletion by the owner
- Blocking unauthorized profile operations

To run the tests, use the following command:
```
clarinet test
```

## Security Considerations

The `user_profile.clar` contract includes several security measures to protect user data and prevent unauthorized access:

**Permission Structure**:
- The contract enforces that users can only perform operations on their own profiles.
- It checks the transaction sender's principal against the profile owner to authorize update and deletion operations.

**Data Validation**:
- The contract validates the length of user input fields, such as username and skincare goals, to prevent injection attacks.
- It checks for the existence of a profile before performing update or deletion operations to avoid errors.

**Privacy Modes**:
- The contract allows users to set their profile's privacy mode to either public or private.
- When retrieving profile information, the contract respects the user's privacy mode and only returns the data if the request is authorized.

**Error Handling**:
- The contract defines several error codes to handle different error scenarios, such as unauthorized access, profile not found, and invalid input.
- These error codes are used throughout the contract to provide meaningful feedback to users and prevent unexpected behavior.

## Examples

**Profile Creation**:
```clarity
(contract-call? 'user_profile 'create-profile
  (tuple (username "testuser") (skin-type "oily") (skincare-goals (list "reduce acne" "moisturize"))))
```

**Profile Update**:
```clarity
(contract-call? 'user_profile 'update-profile
  (some "newusername") (some "combination") (some (list "new goal")))
```

**Privacy Mode Change**:
```clarity
(contract-call? 'user_profile 'set-privacy-mode (uint 1)) ; PRIVACY_PUBLIC
(contract-call? 'user_profile 'set-privacy-mode (uint 2)) ; PRIVACY_PRIVATE
```

**Profile Deletion**:
```clarity
(contract-call? 'user_profile 'delete-profile)
```

**Profile Retrieval**:
```clarity
(contract-call? 'user_profile 'get-profile-info (as-principal 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM))
```