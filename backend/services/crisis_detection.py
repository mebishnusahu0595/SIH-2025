import re
from typing import List, Optional, Dict, Any
from models.schemas import ChatMessage

class CrisisDetectionService:
    def __init__(self):
        # Crisis keywords with different severity levels
        self.high_risk_keywords = {
            'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
            'suicide plan', 'kill me', 'ending it all', 'can\'t go on', 'no point living'
        }
        
        self.medium_risk_keywords = {
            'self harm', 'hurt myself', 'cut myself', 'self injury', 'self mutilation',
            'hate myself', 'worthless', 'burden', 'hopeless', 'nothing matters',
            'give up', 'can\'t take it', 'end the pain'
        }
        
        self.low_risk_keywords = {
            'depressed', 'sad', 'lonely', 'anxious', 'overwhelmed', 'stressed',
            'struggling', 'hard time', 'difficult', 'exhausted', 'tired of life'
        }
        
        # Crisis phrases that might not contain individual keywords
        self.crisis_phrases = [
            r'i want to kill myself',
            r'i am going to kill myself', 
            r'planning to end my life',
            r'thinking about suicide',
            r'better off without me',
            r'nobody would miss me',
            r'world would be better without me',
            r'have a suicide plan',
            r'ready to die',
            r'can\'t live like this',
            r'nothing left to live for'
        ]

    def analyze_message(self, message: str) -> Dict[str, Any]:
        """
        Analyze a message for crisis indicators
        Returns crisis level and confidence score
        """
        if not message:
            return {
                'crisis_detected': False,
                'risk_level': 'none',
                'confidence': 0.0,
                'triggers': []
            }
        
        message_lower = message.lower().strip()
        
        # Remove punctuation for better matching
        cleaned_message = re.sub(r'[^\w\s]', ' ', message_lower)
        
        triggers = []
        risk_score = 0
        
        # Check for high-risk keywords (weight: 10)
        for keyword in self.high_risk_keywords:
            if keyword in message_lower:
                triggers.append(f"high_risk: {keyword}")
                risk_score += 10
        
        # Check for crisis phrases (weight: 15)
        for phrase_pattern in self.crisis_phrases:
            if re.search(phrase_pattern, message_lower):
                triggers.append(f"crisis_phrase: {phrase_pattern}")
                risk_score += 15
        
        # Check for medium-risk keywords (weight: 5)
        for keyword in self.medium_risk_keywords:
            if keyword in message_lower:
                triggers.append(f"medium_risk: {keyword}")
                risk_score += 5
        
        # Check for low-risk keywords (weight: 2)
        for keyword in self.low_risk_keywords:
            if keyword in message_lower:
                triggers.append(f"low_risk: {keyword}")
                risk_score += 2
        
        # Determine risk level and crisis status
        if risk_score >= 10:
            risk_level = 'high'
            crisis_detected = True
        elif risk_score >= 7:
            risk_level = 'medium'
            crisis_detected = True
        elif risk_score >= 4:
            risk_level = 'low'
            crisis_detected = False  # Low risk doesn't trigger full crisis mode
        else:
            risk_level = 'none'
            crisis_detected = False
        
        # Calculate confidence based on number and type of triggers
        confidence = min(risk_score / 20.0, 1.0)  # Normalize to 0-1
        
        return {
            'crisis_detected': crisis_detected,
            'risk_level': risk_level,
            'confidence': confidence,
            'triggers': triggers,
            'risk_score': risk_score
        }

    def analyze_conversation(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """
        Analyze entire conversation for crisis patterns
        """
        if not messages:
            return {
                'crisis_detected': False,
                'risk_level': 'none',
                'confidence': 0.0,
                'pattern_analysis': {}
            }
        
        # Analyze recent messages (last 5)
        recent_messages = messages[-5:] if len(messages) > 5 else messages
        user_messages = [msg for msg in recent_messages if msg.role == 'user']
        
        if not user_messages:
            return {
                'crisis_detected': False,
                'risk_level': 'none',
                'confidence': 0.0,
                'pattern_analysis': {}
            }
        
        # Analyze each message and aggregate
        message_analyses = []
        total_risk_score = 0
        all_triggers = []
        
        for msg in user_messages:
            analysis = self.analyze_message(msg.content)
            message_analyses.append(analysis)
            total_risk_score += analysis['risk_score']
            all_triggers.extend(analysis['triggers'])
        
        # Pattern analysis
        escalating_pattern = self._detect_escalating_pattern(message_analyses)
        persistent_negative = self._detect_persistent_negative_mood(user_messages)
        
        # Calculate overall risk
        avg_risk_score = total_risk_score / len(user_messages)
        
        # Escalating pattern increases risk
        if escalating_pattern:
            avg_risk_score *= 1.5
        
        # Persistent negative mood increases risk
        if persistent_negative:
            avg_risk_score *= 1.2
        
        # Determine final assessment
        if avg_risk_score >= 12:
            overall_risk = 'high'
            crisis_detected = True
        elif avg_risk_score >= 8:
            overall_risk = 'medium'
            crisis_detected = True
        elif avg_risk_score >= 4:
            overall_risk = 'low'
            crisis_detected = False
        else:
            overall_risk = 'none'
            crisis_detected = False
        
        confidence = min(avg_risk_score / 20.0, 1.0)
        
        return {
            'crisis_detected': crisis_detected,
            'risk_level': overall_risk,
            'confidence': confidence,
            'pattern_analysis': {
                'escalating_pattern': escalating_pattern,
                'persistent_negative': persistent_negative,
                'message_count': len(user_messages),
                'avg_risk_score': avg_risk_score
            },
            'triggers': list(set(all_triggers)),  # Remove duplicates
            'individual_analyses': message_analyses
        }

    def _detect_escalating_pattern(self, analyses: List[Dict]) -> bool:
        """Detect if risk is escalating across messages"""
        if len(analyses) < 3:
            return False
        
        risk_scores = [analysis['risk_score'] for analysis in analyses]
        
        # Check if recent messages have higher risk than earlier ones
        recent_avg = sum(risk_scores[-2:]) / 2
        earlier_avg = sum(risk_scores[:-2]) / len(risk_scores[:-2])
        
        return recent_avg > earlier_avg * 1.3  # 30% increase threshold

    def _detect_persistent_negative_mood(self, messages: List[ChatMessage]) -> bool:
        """Detect persistent negative mood indicators"""
        if len(messages) < 3:
            return False
        
        negative_indicators = ['sad', 'depressed', 'hopeless', 'tired', 'alone', 'worthless']
        
        negative_count = 0
        for msg in messages:
            msg_lower = msg.content.lower()
            if any(indicator in msg_lower for indicator in negative_indicators):
                negative_count += 1
        
        # If more than 60% of messages contain negative indicators
        return negative_count / len(messages) > 0.6

    def get_crisis_resources(self) -> Dict[str, Any]:
        """Get crisis intervention resources"""
        return {
            'immediate_help': {
                'suicide_lifeline': {
                    'name': '988 Suicide & Crisis Lifeline',
                    'number': '988',
                    'description': '24/7 free and confidential support'
                },
                'crisis_text_line': {
                    'name': 'Crisis Text Line',
                    'number': 'Text HOME to 741741',
                    'description': 'Free crisis counseling via text'
                },
                'emergency': {
                    'name': 'Emergency Services',
                    'number': '911',
                    'description': 'For immediate danger'
                }
            },
            'online_resources': [
                {
                    'name': 'National Suicide Prevention Lifeline',
                    'url': 'https://suicidepreventionlifeline.org/',
                    'description': 'Resources and support for crisis prevention'
                },
                {
                    'name': 'Crisis Text Line',
                    'url': 'https://www.crisistextline.org/',
                    'description': 'Text-based crisis intervention'
                },
                {
                    'name': 'SAMHSA National Helpline',
                    'url': 'https://www.samhsa.gov/find-help/national-helpline',
                    'description': 'Treatment referral and information service'
                }
            ]
        }