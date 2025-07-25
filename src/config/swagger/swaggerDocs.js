//Authenticatio
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - phone
 *               - fullName
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: secret123
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: "08012345678"
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               referralUsername:
 *                 type: string
 *                 example: referrer01
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 *       401:
 *         description: Error inserting user
 *       500:
 *         description: Error checking user or hashing password
 */



/**
 * @swagger
 * /api/auth/verify/mail:
 *   post:
 *     summary: Verify user email with OTP
 *     tags:
 *       [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: ABC123
 *     responses:
 *       200:
 *         description: User verified successfully
 *       404:
 *         description: Invalid verification code
 *       500:
 *         description: Failed to verify user
 */


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Incorrect username or password
 *       404:
 *         description: User not found
 *       503:
 *         description: Mail not verified
 *       500:
 *         description: Failed to update user verification code
 */

//Users
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get paginated list of users
 *     tags: 
 *       - User
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "Page number (default: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Items per page (default: 10)"
 *     responses:
 *       200:
 *         description: Paginated user data
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user/info:
 *   get:
 *     summary: Get current user info
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user
 */

/**
 * @swagger
 * /api/user/bank/account:
 *   post:
 *     summary: Get user bank account details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User bank details
 *       404:
 *         description: No bank details found
 *       500:
 *         description: Error selecting bank details
 */

/**
 * @swagger
 * /api/user/fund/{id}:
 *   post:
 *     summary: Fund user manually (Admin only)
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet funded successfully
 *       400:
 *         description: Invalid or excessive amount
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user/update/{id}:
 *   put:
 *     summary: Update specific user field
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fieldName:
 *                 type: string
 *                 example: username
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update successful
 *       400:
 *         description: Invalid field
 *       500:
 *         description: Update failed
 */

/**
 * @swagger
 * /api/user/ban/{id}:
 *   put:
 *     summary: Ban a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User banned
 *       500:
 *         description: Failed to ban user
 */

//Monnify payment
/**
 * @swagger
 * /api/monnify/callback:
 *   post:
 *     summary: Monnify webhook callback receiver
 *     tags:
 *       - Monnify
 *     description: Handles transaction callback from Monnify and logs the transaction reference.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventData:
 *                 type: object
 *                 properties:
 *                   transactionReference:
 *                     type: string
 *             example:
 *               eventData:
 *                 transactionReference: "TXN123456789"
 *     responses:
 *       200:
 *         description: Callback received successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Callback received
 */

//Webhook
/**
 * @swagger
 * /api/monnify/webhook:
 *   post:
 *     summary: Handle payment webhook
 *     description: Receives payment notifications from Monnify, verifies the signature, updates user balance, and records the transaction.
 *     tags:
 *       - Payment Webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 example: SUCCESSFUL_TRANSACTION
 *               eventData:
 *                 type: object
 *                 properties:
 *                   product:
 *                     type: object
 *                     properties:
 *                       reference:
 *                         type: string
 *                         example: "d12a3456"
 *                   paymentReference:
 *                     type: string
 *                     example: "MNFY|WEB|123456789"
 *                   paidOn:
 *                     type: string
 *                     example: "2025-07-25T14:52:00.000Z"
 *                   amountPaid:
 *                     type: number
 *                     example: 1000
 *                   paymentMethod:
 *                     type: string
 *                     example: "CARD"
 *                   paymentStatus:
 *                     type: string
 *                     example: "PAID"
 *     parameters:
 *       - in: header
 *         name: monnify-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Signature to verify Monnify webhook
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Webhook proccessed successfully
 *       403:
 *         description: Unauthorized request due to invalid signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized request
 *       500:
 *         description: Internal server error during processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to update user balance
 */

//Payment history
/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     summary: Fetch paginated payment history
 *     tags:
 *       - Payment
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       event_type:
 *                         type: string
 *                       payment_ref:
 *                         type: string
 *                       paid_on:
 *                         type: string
 *                         format: date-time
 *                       amount:
 *                         type: number
 *                       payment_method:
 *                         type: string
 *                       payment_status:
 *                         type: string
 *                       prev_balance:
 *                         type: number
 *                       user_balance:
 *                         type: number
 *       500:
 *         description: Server error while retrieving payment history
 */

//Network
/**
 * @swagger
 * /api/data/network:
 *   get:
 *     summary: Get all active networks
 *     tags:
 *       - Networks
 *     responses:
 *       200:
 *         description: List of active networks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: MTN
 *                   is_active:
 *                     type: string
 *                     example: active
 *       500:
 *         description: Server unavailable
 *         content:
 *           application/json:
 *             example:
 *               message: Server unavailable
 */

//Data
/**
 * @swagger
 * /api/data/types:
 *   post:
 *     summary: Fetch data types based on selected network
 *     tags:
 *       - Data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               choosenNetwork:
 *                 type: string
 *                 example: MTN
 *     responses:
 *       200:
 *         description: A list of data types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */

/**
 * @swagger
 * /api/data/update/types/status:
 *   put:
 *     summary: Update the status (active/inactive) of a data type
 *     tags:
 *       [Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataTypeNetworkName:
 *                 type: string
 *                 example: MTN
 *               dataTypeName:
 *                 type: string
 *                 example: SME
 *               isDataTypeStatus:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /api/data/plans:
 *   post:
 *     summary: Get available data plans for a network and data type
 *     tags:
 *       [Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               choosenNetwork:
 *                 type: string
 *                 example: MTN
 *               choosenDataType:
 *                 type: string
 *                 example: SME
 *     responses:
 *       200:
 *         description: A list of data plans
 */

/**
 * @swagger
 * /api/data/all/plan:
 *   get:
 *     summary: Fetch all available data plans
 *     tags:
 *       [Data]
 *     responses:
 *       200:
 *         description: All data plans with status and pricing
 */

/**
 * @swagger
 * /api/data/plan:
 *   get:
 *     summary: Fetch data plans for each network (MTN, AIRTEL, GLO, 9MOBILE)
 *     tags:
 *       - Data
 *     responses:
 *       200:
 *         description: Grouped data plans
 */

/**
 * @swagger
 * /api/data/update/sme/status:
 *   put:
 *     summary: Update SME data type activation status
 *     tags:
 *       [Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isSmeActive:
 *                 type: string
 *                 example: inactive
 *     responses:
 *       200:
 *         description: SME status updated
 */

/**
 * @swagger
 * /api/data/update/plans:
 *   put:
 *     summary: Bulk update multiple data plans
 *     tags:
 *       [Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 d_id:
 *                   type: string
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 network_name:
 *                   type: string
 *                 data_type:
 *                   type: string
 *                 validity:
 *                   type: string
 *                 user:
 *                   type: number
 *                 reseller:
 *                   type: number
 *                 api:
 *                   type: number
 *                 is_active:
 *                   type: string
 *     responses:
 *       200:
 *         description: All data plans updated successfully
 */

/**
 * @swagger
 * /api/data/purchase/bundle:
 *   post:
 *     summary: Purchase a data bundle
 *     tags:
 *       - Data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan:
 *                 type: string
 *               DataPrice:
 *                 type: number
 *               mobileNumber:
 *                 type: string
 *                 example: "08012345678"
 *               choosenNetwork:
 *                 type: string
 *                 example: MTN
 *               choosenDataType:
 *                 type: string
 *                 example: SME
 *     responses:
 *       200:
 *         description: Data bundle purchase successful
 */

/**
 * @swagger
 * /api/data/history:
 *   get:
 *     summary: Fetch user's data transaction history
 *     tags:
 *       - Data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transaction records
 */

//Protected.
/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Check if user is authorized (not banned)
 *     tags:
 *       - Protected
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authorized user
 *         content:
 *           application/json:
 *             example:
 *               message: Authorized
 *       401:
 *         description: Unauthorized or banned user
 *         content:
 *           application/json:
 *             example:
 *               message: UB
 */

/**
 * @swagger
 * /api/protected/admin/route:
 *   get:
 *     summary: Protected route for admin access
 *     tags:
 *       [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin authorized
 *         content:
 *           application/json:
 *             example:
 *               message: Admin Authorized
 *       401:
 *         description: Unauthorized access
 */

//Airtime
/**
 * @swagger
 * /api/airtime/networkN:
 *   get:
 *     summary: Get all active airtime networks
 *     tags:
 *       - Airtime
 *     responses:
 *       200:
 *         description: List of active airtime networks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server unavailable
 *         content:
 *           application/json:
 *             example:
 *               message: Server unavailable
 */

/**
 * @swagger
 * /api/airtime/type:
 *   get:
 *     summary: Get all active airtime types
 *     tags:
 *       [Airtime]
 *     responses:
 *       200:
 *         description: List of active airtime types
 *       404:
 *         description: No airtime type found
 *         content:
 *           application/json:
 *             example:
 *               error: Airtime type not found
 *       500:
 *         description: Server error while selecting airtime type
 *         content:
 *           application/json:
 *             example:
 *               error: Unable to select Airtime type
 */

/**
 * @swagger
 * /api/airtime/topup:
 *   post:
 *     summary: Perform an airtime top-up using external API
 *     tags:
 *       [Airtime]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               airtimeNChoosen:
 *                 type: string
 *                 example: "MTN"
 *               airtimeTChoosen:
 *                 type: string
 *                 example: "VTU"
 *               mobileN:
 *                 type: string
 *                 example: "08012345678"
 *               amount:
 *                 type: number
 *                 example: 500
 *               actualAmount:
 *                 type: number
 *                 example: 490
 *     responses:
 *       200:
 *         description: Airtime transaction response from external API
 *       403:
 *         description: User banned due to suspicious activity
 *         content:
 *           application/json:
 *             example:
 *               message: Transaction cannot be processed
 *       404:
 *         description: Insufficient wallet balance
 *         content:
 *           application/json:
 *             example:
 *               message: Insufficient wallet balance
 *       500:
 *         description: Failed to process airtime transaction
 *         content:
 *           application/json:
 *             example:
 *               error: Failed to fetch Airtime from external API
 */

/**
 * @swagger
 * /api/airtime/history:
 *   get:
 *     summary: Get user's airtime transaction history
 *     tags:
 *       [Airtime]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's airtime transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   d_id:
 *                     type: integer
 *                   network:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   phone_number:
 *                     type: string
 *                   previous_balance:
 *                     type: number
 *                   new_balance:
 *                     type: number
 *                   status:
 *                     type: string
 *                   airtimeType:
 *                     type: string
 *                   time:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Failed to fetch transaction history
 *         content:
 *           application/json:
 *             example:
 *               message: Failed to select airtime transaction history
 */

//Transation history
/**
 * @swagger
 * /api/transaction/webhook/histories:
 *   post:
 *     summary: Store webhook transaction history
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Payload from the webhook provider
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Webhook transaction details successfully inserted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Webhook transaction details has been successfully inserted
 *       500:
 *         description: Failed to insert webhook transaction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to insert webhook transaction details
 */

//Admin page
/**
 * @swagger
 * /api/admin/details/updated/setting:
 *   put:
 *     summary: Update or insert admin WhatsApp and dashboard settings
 *     tags:
 *       - Admin Page
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               whatsapp_phone:
 *                 type: string
 *                 example: "2348090000000"
 *               whatsapp_number:
 *                 type: string
 *                 example: "+2348090000000"
 *               whatsapp_link:
 *                 type: string
 *                 example: "https://wa.me/2348090000000"
 *               dash_message:
 *                 type: string
 *                 example: "Welcome to the dashboard!"
 *     responses:
 *       200:
 *         description: Settings updated or inserted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User details updated
 *       500:
 *         description: Server error while processing
 */

/**
 * @swagger
 * /api/admin/details:
 *   get:
 *     summary: Fetch admin WhatsApp and dashboard settings
 *     tags:
 *       [Admin Page]
 *     responses:
 *       200:
 *         description: Successfully fetched admin settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 whatsapp_phone:
 *                   type: string
 *                 whatsapp_number:
 *                   type: string
 *                 whatsapp_link:
 *                   type: string
 *                 dash_message:
 *                   type: string
 *       500:
 *         description: Error fetching admin details
 */

/**
 * @swagger
 * /api/admin/dashboard/message:
 *   get:
 *     summary: Fetch dashboard message and WhatsApp link
 *     tags:
 *       [Admin Page]
 *     responses:
 *       200:
 *         description: Dashboard message fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 whatsapp_link:
 *                   type: string
 *                   example: "https://wa.me/2348090000000"
 *                 dash_message:
 *                   type: string
 *                   example: "Welcome to the dashboard!"
 *       500:
 *         description: Error fetching dashboard message
 */

/**
 * @swagger
 * /api/env:
 *   post:
 *     summary: Insert or update API documentation details
 *     tags:
 *       [Admin Page]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_type
 *               - api_key
 *               - api_url
 *             properties:
 *               service_type:
 *                 type: string
 *                 example: airtime
 *               api_key:
 *                 type: string
 *                 example: your_encrypted_key
 *               api_url:
 *                 type: string
 *                 example: "https://api.service.com/v1/endpoint"
 *     responses:
 *       200:
 *         description: API details inserted or updated successfully
 *       500:
 *         description: Failed to insert or update environmental details
 */

/**
 * @swagger
 * /api/env:
 *   get:
 *     summary: Fetch all stored API documentation details
 *     tags:
 *       [Admin Page]
 *     responses:
 *       200:
 *         description: Successfully retrieved API documentation details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   d_id:
 *                     type: integer
 *                     example: 1
 *                   service_type:
 *                     type: string
 *                     example: airtime
 *                   api_key:
 *                     type: string
 *                     example: decrypted_api_key
 *                   api_url:
 *                     type: string
 *                     example: "https://api.service.com/v1/endpoint"
 *       500:
 *         description: Failed to fetch API documentation details
 */

/**
 * @swagger
 * /api/verification:
 *   post:
 *     summary: Update user account verification with NIN or BVN
 *     tags:
 *       [Admin Page]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationType
 *               - verificationNumber
 *             properties:
 *               verificationType:
 *                 type: string
 *                 enum: [NIN, BVN]
 *                 example: NIN
 *               verificationNumber:
 *                 type: string
 *                 example: "12345678901"
 *     responses:
 *       200:
 *         description: User Account Verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User Account Verified
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid NIN
 *       500:
 *         description: Failed to verify user account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to verify user account
 */

//Logout
/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout the user and clear the authentication cookie
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: logout successfully
 */