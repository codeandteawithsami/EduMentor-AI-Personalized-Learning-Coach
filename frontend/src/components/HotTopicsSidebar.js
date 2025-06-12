import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  HStack,
  useColorModeValue,
  Spinner,
  Heading,
  Flex,
  IconButton,
  Badge,
  useToast,
  Divider,
  Tooltip,
  SlideFade
} from '@chakra-ui/react';
import { FaFire, FaSync, FaLightbulb, FaBrain, FaStar, FaChild, FaUserGraduate, FaUser } from 'react-icons/fa';
import axios from 'axios';

export function HotTopicsSidebar({ suggestedQuestions, onQuestionSelect, userPreferences = [], userAge = '' }) {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const toast = useToast();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const accentBg = useColorModeValue('blue.50', 'blue.900');
  const preferenceHighlightBg = useColorModeValue('yellow.50', 'yellow.900');
  const gradientBg = useColorModeValue(
    'linear-gradient(to bottom, #fff0e5, white)',
    'linear-gradient(to bottom, rgba(255, 107, 0, 0.1), transparent)'
  );
  
  // API URL - in production, this would come from env variable
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Topic categories with associated icons
  const topicIcons = [
    { icon: FaLightbulb, color: "yellow.400" },
    { icon: FaBrain, color: "purple.400" },
    { icon: FaStar, color: "cyan.400" }
  ];

  // Function to get topic icon based on index
  const getTopicIcon = (index) => {
    return topicIcons[index % topicIcons.length];
  };

  // Function to check if a topic matches a user preference
  const isTopicInPreferences = (topic) => {
    if (!userPreferences || userPreferences.length === 0) return false;
    
    const topicLower = topic.toLowerCase();
    return userPreferences.some(pref => {
      const prefLower = pref.toLowerCase();
      
      // Check if preference is related to the topic
      return topicLower.includes(prefLower) || 
             prefLower.includes(topicLower) ||
             // Check for partial word matches
             topicLower.split(' ').some(word => prefLower.includes(word) || 
                                              prefLower.split(' ').some(prefWord => word.includes(prefWord)));
    });
  };

  // Function to fetch trending topics from our backend API
  const fetchTrendingTopics = async () => {
    setLoadingTopics(true);
    try {
      // Pass user age and preferences to the trending topics API
      const response = await axios.post(`${API_URL}/api/trending_topics`, {
        limit: 5,
        userAge: userAge,
        userPreferences: userPreferences
      });

      if (response.data && response.data.topics) {
        setTrendingTopics(response.data.topics);
        setRefreshCount(prev => prev + 1);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      toast({
        title: "Couldn't fetch trending topics",
        description: "Using default suggestions instead",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
      
      // If we have user preferences, prioritize them as topics
      if (userPreferences && userPreferences.length > 0) {
        // Use a mix of user preferences and fallback questions
        const mixedTopics = [...userPreferences.slice(0, 3)];
        
        // Add some from fallback to make 5 total
        const remaining = 5 - mixedTopics.length;
        if (remaining > 0) {
          mixedTopics.push(...suggestedQuestions.slice(0, remaining));
        }
        
        setTrendingTopics(mixedTopics);
      } else {
        setTrendingTopics(suggestedQuestions.slice(0, 5));
      }
    } finally {
      setLoadingTopics(false);
    }
  };

  // Load trending topics on component mount or when user preferences/age change
  useEffect(() => {
    fetchTrendingTopics();
  }, [userPreferences, userAge]); // Re-fetch when user data changes

  // Get age-appropriate label
  const getAgeGroupLabel = () => {
    if (!userAge) return null;
    
    const age = parseInt(userAge);
    if (age < 13) return (
      <Flex align="center" mb={2}>
        <Icon as={FaChild} color="green.500" mr={1} />
        <Text fontSize="xs" fontWeight="medium">Kid-friendly topics</Text>
      </Flex>
    );
    
    if (age < 18) return (
      <Flex align="center" mb={2}>
        <Icon as={FaUserGraduate} color="blue.500" mr={1} />
        <Text fontSize="xs" fontWeight="medium">Teen-appropriate topics</Text>
      </Flex>
    );
    
    return (
      <Flex align="center" mb={2}>
        <Icon as={FaUser} color="purple.500" mr={1} />
        <Text fontSize="xs" fontWeight="medium">Topics for adults</Text>
      </Flex>
    );
  };

  // Get preference label if user has preferences
  const getPreferenceLabel = () => {
    if (!userPreferences || userPreferences.length === 0) return null;
    
    return (
      <Flex align="center" mb={2}>
        <Icon as={FaStar} color="yellow.500" mr={1} />
        <Text fontSize="xs" fontWeight="medium">Based on your interests</Text>
      </Flex>
    );
  };

  return (
    <Box 
      bg={cardBg} 
      borderRadius="xl" 
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      h="fit-content"
      position="sticky"
      top="6"
      overflow="hidden"
    >
      {/* Header with gradient background */}
      <Box 
        bgGradient={gradientBg}
        p={4}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Flex 
          justify="space-between" 
          align="center" 
        >
          <HStack>
            <Icon as={FaFire} color="orange.500" boxSize={5} />
            <Heading size="sm">Hot Topics For You</Heading>
          </HStack>
          
          <Tooltip label="Refresh topics" placement="top">
            <IconButton
              icon={<FaSync />}
              variant="ghost"
              size="sm"
              aria-label="Refresh trending topics"
              isLoading={loadingTopics}
              onClick={fetchTrendingTopics}
              _hover={{ bg: accentBg }}
            />
          </Tooltip>
        </Flex>
        <Text fontSize="xs" color="gray.500" mt={1}>
          {userPreferences && userPreferences.length > 0 
            ? "Topics personalized based on your interests"
            : "Discover trending topics and expand your knowledge"
          }
        </Text>
        
        {/* Age or preference labels if applicable */}
        {(userAge || (userPreferences && userPreferences.length > 0)) && (
          <Flex justify="flex-start" mt={2} flexWrap="wrap" gap={2}>
            {getAgeGroupLabel()}
            {getPreferenceLabel()}
          </Flex>
        )}
      </Box>
      
      {/* Topics list */}
      <Box p={4}>
        {loadingTopics ? (
          <Flex justify="center" py={4} direction="column" align="center">
            <Spinner size="sm" mb={2} color="blue.500" />
            <Text fontSize="sm" color="gray.500">Finding hot topics for you...</Text>
          </Flex>
        ) : (
          <VStack spacing={3} align="stretch">
            {trendingTopics.map((topic, index) => {
              const { icon, color } = getTopicIcon(index);
              
              // Check if this topic matches a user preference
              const isPreferenceMatch = isTopicInPreferences(topic);
              
              return (
                <SlideFade in={true} offsetY="10px" delay={index * 0.1} key={index}>
                  <Box
                    p={3}
                    bg={isPreferenceMatch ? preferenceHighlightBg : sectionBg}
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ 
                      bg: hoverBg, 
                      transform: 'translateY(-2px)',
                      boxShadow: 'sm'
                    }}
                    transition="all 0.2s"
                    onClick={() => onQuestionSelect(topic)}
                    borderLeft="3px solid"
                    borderColor={isPreferenceMatch ? "yellow.400" : color}
                  >
                    <Flex align="center" mb={1}>
                      <Icon as={isPreferenceMatch ? FaLightbulb : icon} 
                            color={isPreferenceMatch ? "yellow.400" : color} 
                            boxSize={4} 
                            mr={2} />
                      <Text fontWeight="medium" noOfLines={2}>
                        {topic}
                      </Text>
                    </Flex>
                    <Flex justify="flex-end">
                      <Badge 
                        colorScheme={isPreferenceMatch ? "yellow" : "blue"} 
                        fontSize="xs" 
                        variant="subtle"
                      >
                        {/* {isPreferenceMatch ? "Your interest" : "Trending"} */}
                      </Badge>
                    </Flex>
                  </Box>
                </SlideFade>
              );
            })}
            
            <Divider my={2} />
            
            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              Topics refreshed {refreshCount} {refreshCount === 1 ? 'time' : 'times'} today
            </Text>
          </VStack>
        )}
      </Box>
    </Box>
  );
}