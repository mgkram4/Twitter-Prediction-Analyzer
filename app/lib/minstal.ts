// import MistralClient from '@mistralai/mistralai';

// // Initialize the client with your API key
// const client = new MistralClient(process.env.MISTRAL_API_KEY);

// // Simple test function
// async function testMistralConnection() {
//   try {
//     const response = await client.chat({
//       model: "mistral-small",
//       messages: [
//         { role: "user", content: "Test message: what is 2+2?" }
//       ],
//     });

//     console.log("Connection successful!");
//     console.log("Response:", response.choices[0].message.content);
//     return response;
//   } catch (error) {
//     console.error("Error connecting to Mistral:", error);
//     throw error;
//   }
// }

// // Export for use in API routes
// export { client, testMistralConnection };
