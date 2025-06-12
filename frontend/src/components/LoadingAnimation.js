import React from 'react';
import {
  Box,
  Text,
  VStack,
  useColorModeValue,
  Flex,
  SlideFade,
  Spinner
} from '@chakra-ui/react';

export function LoadingAnimation({ message = "Preparing your personalized learning experience..." }) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const emojis = ['🧠', '📚', '🎓', '✏️', '📝'];
  
  return (
    <Box 
      textAlign="center" 
      py={10} 
      px={6}
      bg={bgColor}
      borderRadius="xl" 
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <SlideFade in={true} offsetY="20px">
        <VStack spacing={6}>
          <Flex justify="center" align="center">
            {emojis.map((emoji, index) => (
              <Text 
                key={index}
                as="span" 
                fontSize="4xl" 
                mx={2}
                style={{ 
                  display: 'inline-block',
                  animation: 'bounce 1s ease-in-out infinite',
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                {emoji}
              </Text>
            ))}
          </Flex>
          
          <Box>
            <Spinner 
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="md"
              mb={4}
            />
            <Text 
              fontSize="lg" 
              fontWeight="medium"
              color={useColorModeValue('gray.600', 'gray.300')}
            >
              {message}
            </Text>
            <Text 
              fontSize="md"
              color={useColorModeValue('gray.500', 'gray.400')}
              fontStyle="italic"
              maxW="500px"
              mx="auto"
              mt={2}
            >
              I'm analyzing the topic, finding the best resources, and creating a personalized learning plan...
            </Text>
          </Box>
        </VStack>
      </SlideFade>
      
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </Box>
  );
}