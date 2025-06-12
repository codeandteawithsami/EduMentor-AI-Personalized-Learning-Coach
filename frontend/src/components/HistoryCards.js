import React from 'react';
import {
  Grid,
  Box,
  Text,
  Heading,
  Icon,
  Badge,
  Flex,
  useColorModeValue,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  HStack
} from '@chakra-ui/react';
import { FaGraduationCap, FaBookOpen, FaRegLightbulb, FaTrash } from 'react-icons/fa';

export function HistoryCards({ sessions, onSessionSelect, onDeleteSession }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  // For delete confirmation dialog
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [sessionToDelete, setSessionToDelete] = React.useState(null);

  // Sort sessions by date (newest first) and take only the latest 6
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  // Function to determine icon based on topic
  const getTopicIcon = (topic) => {
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('machine learning') || lowerTopic.includes('ai')) {
      return FaRegLightbulb;
    } else if (lowerTopic.includes('development') || lowerTopic.includes('programming')) {
      return FaBookOpen;
    } else {
      return FaGraduationCap;
    }
  };

  // Function to get a color based on the topic (for visual distinction)
  const getTopicColor = (topic) => {
    const topicHash = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['blue', 'teal', 'green', 'purple', 'cyan', 'orange'];
    return colors[topicHash % colors.length];
  };
  
  // Handler for delete button click
  const handleDeleteClick = (e, session) => {
    console.log("Delete button clicked in SessionSidebar for session:", session.id);
    e.stopPropagation(); // Prevent session selection when clicking delete
    setSessionToDelete(session);
    onDeleteAlertOpen();
  };

  // Confirm session deletion
  const confirmDeleteSession = () => {
    console.log("Confirm delete in SessionSidebar for session:", sessionToDelete?.id);
    if (sessionToDelete && onDeleteSession) {
      console.log("onDeleteSession exists:", !!onDeleteSession);
      onDeleteSession(sessionToDelete.id);
      onDeleteAlertClose();
      setSessionToDelete(null);
    } else {
      console.error("Missing sessionToDelete or onDeleteSession function");
    }
  };

  // Add this at the start of the component function to check if onDeleteSession is properly passed
  console.log("SessionSidebar: onDeleteSession prop exists:", !!onDeleteSession);

  // If no sessions, return a message
  if (recentSessions.length === 0) {
    return (
      <Box textAlign="center" p={6}>
        <Heading size="md" mb={2}>Start Your Learning Journey</Heading>
        <Text>Enter a topic above or select a suggested topic to begin.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Recent Learning Sessions</Heading>
      <Grid 
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={4}
      >
        {recentSessions.map((session) => {
          const topicColor = getTopicColor(session.topic);
          const TopicIcon = getTopicIcon(session.topic);
          
          return (
            <Box
              key={session.id}
              bg={cardBg}
              p={4}
              borderRadius="lg"
              border="1px"
              borderColor={cardBorder}
              boxShadow="sm"
              cursor="pointer"
              onClick={() => onSessionSelect(session)}
              _hover={{ 
                bg: hoverBg,
                transform: 'translateY(-2px)',
                boxShadow: 'md'
              }}
              transition="all 0.2s"
              position="relative"
            >
              <Flex mb={3} align="center">
                <Icon 
                  as={TopicIcon} 
                  color={`${topicColor}.500`} 
                  boxSize={5} 
                  mr={2} 
                  bg={`${topicColor}.100`}
                  p={1}
                  borderRadius="full"
                />
                <Text fontWeight="bold" noOfLines={1} flex="1">
                  {session.topic}
                </Text>
                <IconButton
                  icon={<FaTrash />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  opacity="0.7"
                  onClick={(e) => handleDeleteClick(e, session)}
                  aria-label="Delete session"
                  _hover={{ opacity: 1 }}
                  ml={1}
                />
              </Flex>
              
              <Flex justify="space-between" align="center" mt={2}>
                <Badge colorScheme={topicColor}>
                  {session.assessment?.level || "Beginner"}
                </Badge>
                <Badge colorScheme="gray">
                  {new Date(session.timestamp).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Badge>
              </Flex>
            </Box>
          );
        })}
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="lg">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Learning Session
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the session on "{sessionToDelete?.topic}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <HStack spacing={3}>
                <Button ref={cancelRef} onClick={onDeleteAlertClose} borderRadius="md">
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={confirmDeleteSession}
                  borderRadius="md"
                  leftIcon={<FaTrash />}
                >
                  Delete
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}