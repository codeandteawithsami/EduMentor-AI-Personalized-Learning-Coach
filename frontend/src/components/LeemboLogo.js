import React from 'react';
import { Flex, Icon, Heading, useColorModeValue } from '@chakra-ui/react';
import { FaGraduationCap } from 'react-icons/fa';

export function LeemboLogo({ size = "md", onClick }) {
  const accentColor = useColorModeValue('blue.600', 'blue.200');
  const bgColor = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("blue.100", "blue.700");
  
  // Size variants  
  const sizeProps = {
    sm: {
      p: 2,
      boxSize: 4,
      headingSize: "sm",
      borderRadius: "lg"
    },
    md: {
      p: 3,
      boxSize: 6,
      headingSize: "md",
      borderRadius: "xl"
    },
    lg: {
      p: 4,
      boxSize: 8,
      headingSize: "lg",
      borderRadius: "xl"
    }
  };
  
  const { p, boxSize, headingSize, borderRadius } = sizeProps[size] || sizeProps.md;
  
  return (
    <Flex 
      align="center" 
      bg={bgColor} 
      p={p} 
      borderRadius={borderRadius}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      cursor={onClick ? "pointer" : "default"}
      // _hover={onClick ? { 
      //   transform: "translateY(-2px)", 
      //   boxShadow: "md",
      //   borderColor: "blue.300"
      // } : {}}
      transition="all 0.2s ease"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? "Go to home" : undefined}
    >
      <Icon as={FaGraduationCap} boxSize={boxSize} color={accentColor} mr={2} />
      <Heading as="h1" size={headingSize} color={accentColor}>
        Leembo.AI
      </Heading>
    </Flex>
  );
}