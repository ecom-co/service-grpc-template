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

console.log('🧪 Testing with valid data...\n');

const validRequest = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
};

client.CreateUser(validRequest, (error, response) => {
    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Success:', JSON.stringify(response, null, 2));
    }
    
    process.exit(0);
});
