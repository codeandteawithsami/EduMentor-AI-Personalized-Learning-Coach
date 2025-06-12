import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Badge,
  Heading,
  Flex,
  IconButton,
  useColorModeValue,
  useToast,
  Icon,
  HStack,
  Tooltip
} from '@chakra-ui/react';
import { FaThumbsUp, FaThumbsDown, FaLightbulb, FaBirthdayCake, FaBook } from 'react-icons/fa';

export function PersonalizedLearningHeader({ 
  topic, 
  userName, 
  assessment,
  userAge = '',
  userPreferences = []
}) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const highlightBg = useColorModeValue('blue.50', 'blue.900');
  
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  const getLevelEmoji = (level) => {
    if (level === 'Beginner') return '🌱';
    if (level === 'Intermediate') return '🌟';
    if (level === 'Advanced') return '🚀';
    return '📚';
  };
  
  const getStyleEmoji = (style) => {
    if (style === 'Visual') return '👁️';
    if (style === 'Auditory') return '👂';
    if (style === 'Reading') return '📖';
    if (style === 'Kinesthetic') return '🤹';
    return '🧠';
  };

  // Function to get Age-appropriate display text
  const getAgeContextText = () => {
    if (!userAge) return null;
    
    const age = parseInt(userAge);
    if (age < 13) return "I've made sure this content is kid-friendly and easy to understand.";
    if (age < 18) return "I've tailored this content to be engaging for teen learners.";
    return "This content is designed for adult learners.";
  };
  
  const handleFeedback = (isPositive) => {
    setFeedbackGiven(true);
    toast({
      title: isPositive ? 'Thanks for the feedback!' : 'Sorry about that',
      description: isPositive 
        ? "I'm glad the materials are helpful!"
        : "I'll try to improve your recommendations next time.",
      status: isPositive ? 'success' : 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Check if any user preferences are related to the current topic
  const hasRelevantPreferences = () => {
    if (!userPreferences || userPreferences.length === 0 || !topic) return false;
    
    const topicLower = topic.toLowerCase();
    return userPreferences.some(pref => {
      const prefLower = pref.toLowerCase();
      return topicLower.includes(prefLower) || 
             prefLower.includes(topicLower) ||
             topicLower.split(' ').some(word => prefLower.includes(word));
    });
  };

  return (
    <Box bg={cardBg} p={5} borderRadius="lg" shadow="md" mb={4}>
      <VStack align="stretch" spacing={3}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="md" color="gray.500">
              {getTimeBasedGreeting()}, {userName}!
            </Text>
            <Heading size="md" mt={1}>
              Learning: {topic}
            </Heading>
          </Box>
          
          {!feedbackGiven ? (
            <Flex>
              <Text fontSize="sm" color="gray.500" mr={2}>
                Is this helpful?
              </Text>
              <IconButton
                icon={<FaThumbsUp />}
                size="sm"
                variant="ghost"
                colorScheme="green"
                aria-label="Helpful"
                mr={1}
                onClick={() => handleFeedback(true)}
              />
              <IconButton
                icon={<FaThumbsDown />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                aria-label="Not helpful"
                onClick={() => handleFeedback(false)}
              />
            </Flex>
          ) : (
            <Badge colorScheme="green" p={2} borderRadius="md">
              Feedback received
            </Badge>
          )}
        </Flex>
        
        <Flex bg={highlightBg} p={3} borderRadius="md" align="center">
          <Box mr={4}>
            <Flex align="center" mb={1}>
              <Text fontSize="sm" fontWeight="bold" mr={1}>Level:</Text>
              <Badge colorScheme="blue" variant="solid">
                {getLevelEmoji(assessment.level)} {assessment.level}
              </Badge>
            </Flex>
            <Flex align="center">
              <Text fontSize="sm" fontWeight="bold" mr={1}>Style:</Text>
              <Badge colorScheme="green" variant="solid">
                {getStyleEmoji(assessment.style)} {assessment.style}
              </Badge>
            </Flex>
            
            {/* Age badge if available */}
            {userAge && (
              <Flex align="center" mt={1}>
                <Text fontSize="sm" fontWeight="bold" mr={1}>Age:</Text>
                <Badge colorScheme="purple" variant="solid">
                  <Flex align="center">
                    <Icon as={FaBirthdayCake} mr={1} />
                    <Text>{userAge}</Text>
                  </Flex>
                </Badge>
              </Flex>
            )}
          </Box>
          
          <Box flex="1">
            <VStack align="stretch" spacing={1}>
              <Text fontSize="sm" fontStyle="italic">
                I&apos;ve tailored these materials specifically for your {assessment.level} level 
                with a focus on {assessment.style.toLowerCase()} learning approaches.
              </Text>
              
              {/* Age-specific context text if available */}
              {getAgeContextText() && (
                <Text fontSize="sm" fontStyle="italic">
                  {getAgeContextText()}
                </Text>
              )}
              
              {/* Preference-related note if relevant */}
              {hasRelevantPreferences() && (
                <Flex align="center" mt={1}>
                  <Icon as={FaLightbulb} color="yellow.500" mr={1} />
                  <Text fontSize="sm" fontStyle="italic">
                    Connected to your interests in {userPreferences.join(', ')}.
                  </Text>
                </Flex>
              )}
            </VStack>
          </Box>
        </Flex>
        
        {/* User interests section */}
        {userPreferences && userPreferences.length > 0 && (
          <Box>
            <HStack spacing={2} mb={1}>
              <Icon as={FaBook} color="blue.500" size="sm" />
              <Text fontSize="sm" fontWeight="medium">Your Learning Interests:</Text>
            </HStack>
            <Flex flexWrap="wrap" gap={1}>
              {userPreferences.map((pref, idx) => (
                <Tooltip key={idx} label={`Topics related to ${pref} will be highlighted`} placement="top" hasArrow>
                  <Badge 
                    colorScheme="blue" 
                    variant="subtle" 
                    m={0.5}
                    borderRadius="full"
                  >
                    {pref}
                  </Badge>
                </Tooltip>
              ))}
            </Flex>
          </Box>
        )}
        
        <Text fontSize="sm">
          Let me know if you&apos;d like to adjust any of these settings for a different learning experience.
        </Text>
      </VStack>
    </Box>
  );
}