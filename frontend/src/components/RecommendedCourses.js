import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Link,
  SimpleGrid,
  Flex,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  Skeleton,
  Button,
  Tooltip,
  VStack
} from '@chakra-ui/react';
import { FaYoutube, FaExternalLinkAlt, FaGraduationCap, FaPlayCircle, FaStar, FaClock, FaSync, FaBook, FaLaptop, FaUser } from 'react-icons/fa';
import axios from 'axios';

// Mock recommended courses - fallback data if API fails
const FALLBACK_COURSES = [
  {
    id: 1,
    title: "Complete Machine Learning & Data Science Bootcamp",
    platform: "YouTube",
    instructor: "freeCodeCamp.org",
    duration: "11 hours",
    rating: 4.8,
    url: "https://www.youtube.com/watch?v=cBBTWcHkVVY",
    tags: ["Machine Learning", "Data Science", "Python"]
  },
  {
    id: 2,
    title: "JavaScript Crash Course for Beginners",
    platform: "YouTube",
    instructor: "Traversy Media",
    duration: "1.5 hours",
    rating: 4.9,
    url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
    tags: ["JavaScript", "Web Development", "Programming"]
  },
  {
    id: 3,
    title: "Modern React with Redux",
    platform: "Udemy",
    instructor: "Stephen Grider",
    duration: "52 hours",
    rating: 4.7,
    url: "https://www.udemy.com/course/react-redux/",
    tags: ["React", "Redux", "Web Development"]
  },
  {
    id: 4,
    title: "Physics 101: Introduction to Mechanics",
    platform: "Coursera",
    instructor: "University of California",
    duration: "8 weeks",
    rating: 4.6,
    url: "https://www.coursera.org/learn/physics-mechanics",
    tags: ["Physics", "Mechanics", "Science"]
  }
];

export function RecommendedCourses({ userPreferences = [], currentTopic = "" }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tagBg = useColorModeValue('blue.50', 'blue.900');
  
  // Function to get platform color
  const getPlatformColor = (platform) => {
    switch(platform.toLowerCase()) {
      case 'youtube':
        return "red.600";
      case 'udemy':
        return "purple.600";
      case 'coursera':
        return "blue.600";
      case 'edx':
        return "green.700";
      default:
        return "gray.600";
    }
  };
  
  // Function to get platform icon
  const getPlatformIcon = (platform) => {
    switch(platform.toLowerCase()) {
      case 'youtube':
        return <Icon as={FaYoutube} color="white" boxSize={4} />;
      case 'udemy':
        return <Icon as={FaLaptop} color="white" boxSize={4} />;
      case 'coursera':
        return <Icon as={FaGraduationCap} color="white" boxSize={4} />;
      case 'edx':
        return <Icon as={FaBook} color="white" boxSize={4} />;
      default:
        return <Icon as={FaExternalLinkAlt} color="white" boxSize={4} />;
    }
  };
  
  // Function to filter courses by relevance to user preferences or current topic
  const getRelevantCourses = (allCourses, userPrefs, topic) => {
    if ((!userPrefs || userPrefs.length === 0) && !topic) {
      return allCourses.slice(0, 4); // Return first 4 if no preferences
    }
    
    // Score each course based on relevance to preferences and current topic
    const scoredCourses = allCourses.map(course => {
      let score = 0;
      
      // Check if course matches current topic
      if (topic && course.title.toLowerCase().includes(topic.toLowerCase())) {
        score += 5; // Higher weight for current topic
      }
      
      if (topic && course.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase()))) {
        score += 3;
      }
      
      // Check if course matches any user preferences
      if (userPrefs && userPrefs.length > 0) {
        userPrefs.forEach(pref => {
          if (course.title.toLowerCase().includes(pref.toLowerCase())) {
            score += 2;
          }
          
          if (course.tags.some(tag => tag.toLowerCase().includes(pref.toLowerCase()))) {
            score += 1;
          }
        });
      }
      
      return { ...course, relevanceScore: score };
    });
    
    // Sort by relevance score (high to low) then by rating
    return scoredCourses
      .sort((a, b) => b.relevanceScore - a.relevanceScore || b.rating - a.rating)
      .slice(0, 4); // Return top 4 courses
  };
  
  const fetchRecommendedCourses = async () => {
    setLoading(true);
    setError(null);
    
    // API URL - in production, this would come from env variable
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    
    try {
      // Call the backend API endpoint for recommended courses
      const response = await axios.post(`${API_URL}/api/recommended_courses`, {
        userPreferences: userPreferences,
        currentTopic: currentTopic,
        limit: 4
      });
      
      if (response.data && response.data.courses) {
        setCourses(response.data.courses);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load recommended courses");
      // Fall back to default courses if API fails
      setCourses(FALLBACK_COURSES.slice(0, 4));
    } finally {
      setLoading(false);
    }
  };
  
  // Load courses on component mount or when preferences/topic change
  useEffect(() => {
    fetchRecommendedCourses();
  }, [userPreferences, currentTopic]);
  
  // Return early if error
  if (error) {
    return (
      <Box mt={6} textAlign="center">
        <Text color="red.500">{error}</Text>
        <Button mt={2} onClick={fetchRecommendedCourses} size="sm">
          Try Again
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={2}>
          <Icon as={FaPlayCircle} color="green.500" boxSize={5} />
          <Heading size="md">Recommended Courses</Heading>
        </HStack>
        
        <Tooltip label="Refresh recommendations">
          <Button
            leftIcon={<FaSync />}
            size="xs"
            variant="outline"
            colorScheme="green"
            isLoading={loading}
            onClick={fetchRecommendedCourses}
          >
            Refresh
          </Button>
        </Tooltip>
      </Flex>
      
      {/* Loading Skeletons */}
      {loading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          {[1, 2, 3, 4].map((i) => (
            <Box 
              key={i}
              borderWidth="1px" 
              borderRadius="lg" 
              overflow="hidden"
              borderColor={borderColor}
              bg={cardBg}
            >
              <Skeleton height="45px" />
              <Box p={4}>
                <Skeleton height="22px" width="90%" mb={3} />
                <Skeleton height="18px" width="70%" mb={3} />
                <Skeleton height="12px" width="40%" mb={2} />
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <>
          {courses.length === 0 ? (
            <Text textAlign="center" py={4}>No courses found matching your interests</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={course.url}
                  isExternal
                  _hover={{ textDecoration: 'none' }}
                >
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ 
                      transform: 'translateY(-5px)', 
                      shadow: 'md',
                      borderColor: 'green.300'
                    }}
                    bg={cardBg}
                    borderColor={borderColor}
                    height="100%"
                    position="relative"
                  >
                    {/* Platform Badge - replace image with a colorful header section */}
                    <Box 
                      py={3} 
                      px={4}
                      borderBottom="1px"
                      borderColor={borderColor}
                      bg={getPlatformColor(course.platform)}
                      color="white"
                    >
                      <Flex align="center" justify="space-between">
                        <Flex align="center">
                          {getPlatformIcon(course.platform)}
                          <Text ml={2} fontWeight="bold" fontSize="sm">
                            {course.platform}
                          </Text>
                        </Flex>
                        <Flex align="center">
                          <Icon as={FaStar} color="yellow.300" mr={1} boxSize={3} />
                          <Text fontSize="sm">{course.rating}</Text>
                        </Flex>
                      </Flex>
                    </Box>
                    
                    <VStack p={4} align="stretch" spacing={3}>
                      <Text fontWeight="bold" noOfLines={2} fontSize="md">
                        {course.title}
                      </Text>
                      
                      <Flex justify="space-between" fontSize="sm" color="gray.600">
                        <Flex align="center">
                          <Icon as={FaUser} color="gray.500" mr={1} boxSize={3} />
                          <Text noOfLines={1}>{course.instructor}</Text>
                        </Flex>
                        
                        <Flex align="center">
                          <Icon as={FaClock} color="gray.500" mr={1} boxSize={3} />
                          <Text>{course.duration}</Text>
                        </Flex>
                      </Flex>
                      
                      <Flex flexWrap="wrap" gap={1} mt={1}>
                        {course.tags.slice(0, 3).map((tag, idx) => (
                          <Badge
                            key={idx}
                            bg={tagBg}
                            color="blue.600"
                            fontSize="10px"
                            borderRadius="full"
                            px={2}
                            py={0.5}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    </VStack>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
}