;; GlowGrid User Profile Contract
;; Secure, privacy-focused user profile management for beauty app

;; Error Codes
(define-constant ERR_UNAUTHORIZED u403)
(define-constant ERR_PROFILE_NOT_FOUND u404)
(define-constant ERR_PROFILE_ALREADY_EXISTS u409)
(define-constant ERR_INVALID_INPUT u400)

;; Privacy Modes
(define-constant PRIVACY_PUBLIC u1)
(define-constant PRIVACY_PRIVATE u2)

;; User Profile Data Structure
(define-map user-profiles 
  principal 
  {
    username: (string-utf8 50),
    skin-type: (string-utf8 20),
    skincare-goals: (list 5 (string-utf8 50)),
    privacy-mode: uint,
    profile-created: bool
  }
)

;; Create User Profile
(define-public (create-profile 
  (username (string-utf8 50))
  (skin-type (string-utf8 20))
  (skincare-goals (list 5 (string-utf8 50)))
)
  (begin
    ;; Check if profile already exists
    (asserts! (is-none (map-get? user-profiles tx-sender)) 
      (err ERR_PROFILE_ALREADY_EXISTS))
    
    ;; Validate input lengths
    (asserts! (> (len username) u0) (err ERR_INVALID_INPUT))
    (asserts! (<= (len skincare-goals) u5) (err ERR_INVALID_INPUT))
    
    ;; Create profile with default private mode
    (map-set user-profiles tx-sender {
      username: username,
      skin-type: skin-type,
      skincare-goals: skincare-goals,
      privacy-mode: PRIVACY_PRIVATE,
      profile-created: true
    })
    
    (ok true)
  )
)

;; Update User Profile
(define-public (update-profile 
  (username (optional (string-utf8 50)))
  (skin-type (optional (string-utf8 20)))
  (skincare-goals (optional (list 5 (string-utf8 50))))
)
  (let (
    (current-profile (unwrap! (map-get? user-profiles tx-sender) 
                      (err ERR_PROFILE_NOT_FOUND)))
  )
    ;; In this contract, the tx-sender is the profile owner
    ;; No additional authorization check needed
    
    ;; Update profile with optional parameters
    (map-set user-profiles tx-sender (merge current-profile {
      username: (default-to (get username current-profile) username),
      skin-type: (default-to (get skin-type current-profile) skin-type),
      skincare-goals: (default-to (get skincare-goals current-profile) skincare-goals)
    }))
    
    (ok true)
  )
)

;; Get Profile Info with Privacy Check
(define-read-only (get-profile-info (user principal))
  (let (
    (profile (unwrap! (map-get? user-profiles user) 
               (err ERR_PROFILE_NOT_FOUND)))
  )
    ;; Privacy mode check
    (if (or 
          (is-eq (get privacy-mode profile) PRIVACY_PUBLIC)
          (is-eq tx-sender user)
        )
        (ok {
          username: (get username profile),
          skin-type: (get skin-type profile),
          skincare-goals: (get skincare-goals profile)
        })
        (err ERR_UNAUTHORIZED)
    )
  )
)

;; Set Privacy Mode
(define-public (set-privacy-mode (mode uint))
  (let (
    (current-profile (unwrap! (map-get? user-profiles tx-sender) 
                      (err ERR_PROFILE_NOT_FOUND)))
  )
    ;; Validate privacy mode input
    (asserts! (or 
                (is-eq mode PRIVACY_PUBLIC) 
                (is-eq mode PRIVACY_PRIVATE)
              ) (err ERR_INVALID_INPUT))
    
    ;; Update privacy mode
    (map-set user-profiles tx-sender (merge current-profile {
      privacy-mode: mode
    }))
    
    (ok true)
  )
)

;; Delete User Profile
(define-public (delete-profile)
  (begin
    ;; Check profile exists
    (asserts! (is-some (map-get? user-profiles tx-sender)) 
      (err ERR_PROFILE_NOT_FOUND))
    
    ;; Delete profile
    (map-delete user-profiles tx-sender)
    
    (ok true)
  )
)

;; Optional: Utility function to check if profile exists
(define-read-only (profile-exists (user principal))
  (is-some (map-get? user-profiles user))
)