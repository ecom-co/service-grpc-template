const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto file
const packageDefinition = protoLoader.loadSync('./src/proto/services/user.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Create client
const client = new userProto.UserService('localhost:50052', grpc.credentials.createInsecure());

console.log('🧪 Testing gRPC Validation Details...\n');

// Test with invalid data to see detailed errors
console.log('Testing with invalid data:');
const invalidRequest = {
    name: 'J', // Too short
    email: 'invalid-email',
    password: '123' // Too short
};

client.CreateUser(invalidRequest, (error, response) => {
    if (error) {
        console.log('❌ Validation Error Details:');
        console.log('Code:', error.code);
        console.log('Message:', error.message);
        console.log('Details (raw):', error.details);
        
        // Try to parse details if it's a string
        if (error.details && typeof error.details === 'string') {
            try {
                const parsedDetails = JSON.parse(error.details);
                console.log('Details (parsed):', JSON.stringify(parsedDetails, null, 2));
            } catch (e) {
                console.log('Could not parse details as JSON');
            }
        }
        
        // Log all error properties
        console.log('\nAll error properties:');
        Object.keys(error).forEach(key => {
            console.log(`${key}:`, error[key]);
        });
    } else {
        console.log('✅ Unexpected success:', response);
    }
    
    process.exit(0);
});
