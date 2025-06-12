import React from 'react';
import {
  Box, 
  Flex, 
  Text, 
  Button, 
  useColorModeValue, 
  Icon,
  HStack
} from '@chakra-ui/react';
import { FaGraduationCap, FaPlus } from 'react-icons/fa';
import { EduMentorLogo } from './LeemboLogo'; // Import the logo component

export function TopNavbar({ onNewChat, sidebarOpen, userName }) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="64px" // Increased height from 48px to 64px
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      zIndex={37}
      px={4}
    >
      <Flex h="100%" justify="space-between" align="center">
        {/* App Logo in the Left Corner */}
        <Box ml={sidebarOpen ? "60px" : "40px"} display="flex" alignItems="center">
          <EduMentorLogo size="sm" />
        </Box>
        
        <Flex 
          align="center" 
          justify="flex-end" 
          flex={1}
        >
          <HStack spacing={3}>
            <Button
              leftIcon={<FaPlus />}
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={onNewChat}
              borderRadius="md"
            >
              New Chat
            </Button>
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
}