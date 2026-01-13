"""AI-powered insights for Info Hunter.

Provides document summarization, trend analysis, and intelligent recommendations.
"""

import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from collections import Counter
import re


@dataclass
class DocumentSummary:
    """AI-generated summary of a document."""
    document_id: str
    title: str
    summary: str
    key_points: List[str]
    categories: List[str]
    sentiment: str  # positive, negative, neutral
    generated_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class TrendAnalysis:
    """Analysis of trends across documents."""
    period_start: datetime
    period_end: datetime
    total_documents: int
    by_source_type: Dict[str, int]
    top_keywords: List[tuple]  # (keyword, count)
    growth_rate: float  # percentage change from previous period
    insights: List[str]


@dataclass
class Recommendation:
    """A recommendation based on aggregated data."""
    id: str
    title: str
    description: str
    relevance_score: float
    source_type: str
    source_url: str
    reasons: List[str]


class TextAnalyzer:
    """Analyzes text content for insights."""
    
    # Common stop words to filter out
    STOP_WORDS = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
        'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
        'we', 'us', 'our', 'you', 'your', 'he', 'she', 'him', 'her', 'his',
        'i', 'me', 'my', 'who', 'what', 'which', 'when', 'where', 'why', 'how',
        'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
        'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very',
    }
    
    # Positive and negative sentiment words
    POSITIVE_WORDS = {
        'excellent', 'great', 'good', 'best', 'amazing', 'wonderful', 'fantastic',
        'outstanding', 'exceptional', 'perfect', 'love', 'recommend', 'success',
        'opportunity', 'benefit', 'advantage', 'free', 'scholarship', 'award',
        'winner', 'top', 'leading', 'innovative', 'exciting', 'valuable',
    }
    
    NEGATIVE_WORDS = {
        'bad', 'poor', 'worst', 'terrible', 'awful', 'horrible', 'disappointing',
        'failed', 'failure', 'problem', 'issue', 'error', 'wrong', 'difficult',
        'expensive', 'costly', 'limited', 'restricted', 'deadline', 'expired',
        'closed', 'unavailable', 'rejected', 'denied',
    }
    
    def extract_keywords(self, text: str, top_n: int = 10) -> List[tuple]:
        """Extract top keywords from text."""
        # Tokenize and clean
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Filter stop words
        words = [w for w in words if w not in self.STOP_WORDS]
        
        # Count and return top N
        counter = Counter(words)
        return counter.most_common(top_n)
    
    def analyze_sentiment(self, text: str) -> str:
        """Analyze sentiment of text."""
        words = set(re.findall(r'\b[a-zA-Z]+\b', text.lower()))
        
        positive_count = len(words & self.POSITIVE_WORDS)
        negative_count = len(words & self.NEGATIVE_WORDS)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        return "neutral"
    
    def extract_key_points(self, text: str, max_points: int = 5) -> List[str]:
        """Extract key points from text."""
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        # Score sentences by keyword density
        scored = []
        keywords = set(w for w, _ in self.extract_keywords(text, 20))
        
        for sentence in sentences:
            words = set(re.findall(r'\b[a-zA-Z]+\b', sentence.lower()))
            score = len(words & keywords) / max(len(words), 1)
            scored.append((score, sentence))
        
        # Return top sentences
        scored.sort(reverse=True)
        return [s for _, s in scored[:max_points]]
    
    def categorize(self, text: str, source_type: str) -> List[str]:
        """Categorize document based on content."""
        categories = []
        text_lower = text.lower()
        
        # Source type category
        categories.append(source_type)
        
        # Content-based categories
        if any(w in text_lower for w in ['deadline', 'apply', 'application']):
            categories.append('application')
        if any(w in text_lower for w in ['free', 'no cost', 'scholarship']):
            categories.append('free')
        if any(w in text_lower for w in ['remote', 'online', 'virtual']):
            categories.append('remote')
        if any(w in text_lower for w in ['paid', 'salary', 'stipend', 'compensation']):
            categories.append('paid')
        if any(w in text_lower for w in ['beginner', 'entry', 'no experience']):
            categories.append('entry-level')
        if any(w in text_lower for w in ['advanced', 'senior', 'experienced']):
            categories.append('advanced')
        
        return categories


class InsightsEngine:
    """Generates AI-powered insights from aggregated data."""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.api_key = openai_api_key or os.environ.get("OPENAI_API_KEY")
        self.text_analyzer = TextAnalyzer()
        self._use_ai = bool(self.api_key)
    
    def summarize_document(self, document: Dict[str, Any]) -> DocumentSummary:
        """Generate a summary for a document."""
        title = document.get("title", "Untitled")
        description = document.get("description", "")
        content = document.get("content", {})
        source_type = document.get("source_type", "unknown")
        
        # Combine text content
        full_text = f"{title} {description} {json.dumps(content)}"
        
        # Extract insights
        key_points = self.text_analyzer.extract_key_points(full_text)
        categories = self.text_analyzer.categorize(full_text, source_type)
        sentiment = self.text_analyzer.analyze_sentiment(full_text)
        
        # Generate summary
        if description:
            summary = description[:500]
        else:
            summary = " ".join(key_points[:2]) if key_points else title
        
        return DocumentSummary(
            document_id=document.get("id", ""),
            title=title,
            summary=summary,
            key_points=key_points,
            categories=categories,
            sentiment=sentiment,
        )
    
    def analyze_trends(
        self, 
        documents: List[Dict[str, Any]],
        period_days: int = 7
    ) -> TrendAnalysis:
        """Analyze trends across documents."""
        now = datetime.utcnow()
        period_start = now - timedelta(days=period_days)
        
        # Filter to period
        period_docs = []
        for doc in documents:
            scraped_at = doc.get("scraped_at")
            if isinstance(scraped_at, str):
                try:
                    scraped_at = datetime.fromisoformat(scraped_at.replace("Z", "+00:00"))
                except:
                    scraped_at = now
            if scraped_at and scraped_at >= period_start:
                period_docs.append(doc)
        
        # Count by source type
        by_source_type = Counter(doc.get("source_type", "unknown") for doc in period_docs)
        
        # Extract keywords from all documents
        all_text = " ".join(
            f"{doc.get('title', '')} {doc.get('description', '')}"
            for doc in period_docs
        )
        top_keywords = self.text_analyzer.extract_keywords(all_text, 15)
        
        # Calculate growth (simplified - compare to previous period)
        prev_period_start = period_start - timedelta(days=period_days)
        prev_docs = [
            doc for doc in documents
            if doc.get("scraped_at") and 
            prev_period_start <= datetime.fromisoformat(
                doc["scraped_at"].replace("Z", "+00:00") if isinstance(doc["scraped_at"], str) else str(doc["scraped_at"])
            ) < period_start
        ]
        
        if prev_docs:
            growth_rate = ((len(period_docs) - len(prev_docs)) / len(prev_docs)) * 100
        else:
            growth_rate = 100.0 if period_docs else 0.0
        
        # Generate insights
        insights = self._generate_trend_insights(
            period_docs, by_source_type, top_keywords, growth_rate
        )
        
        return TrendAnalysis(
            period_start=period_start,
            period_end=now,
            total_documents=len(period_docs),
            by_source_type=dict(by_source_type),
            top_keywords=top_keywords,
            growth_rate=growth_rate,
            insights=insights,
        )
    
    def _generate_trend_insights(
        self,
        documents: List[Dict],
        by_source_type: Counter,
        top_keywords: List[tuple],
        growth_rate: float
    ) -> List[str]:
        """Generate human-readable trend insights."""
        insights = []
        
        # Volume insight
        if growth_rate > 20:
            insights.append(f"📈 Data volume increased by {growth_rate:.1f}% compared to previous period")
        elif growth_rate < -20:
            insights.append(f"📉 Data volume decreased by {abs(growth_rate):.1f}% compared to previous period")
        else:
            insights.append(f"📊 Data volume remained stable ({growth_rate:+.1f}%)")
        
        # Top source type
        if by_source_type:
            top_type, top_count = by_source_type.most_common(1)[0]
            insights.append(f"🏆 Most active category: {top_type} ({top_count} documents)")
        
        # Trending keywords
        if top_keywords:
            trending = ", ".join(kw for kw, _ in top_keywords[:5])
            insights.append(f"🔥 Trending keywords: {trending}")
        
        # Diversity insight
        if len(by_source_type) >= 3:
            insights.append(f"🌐 Good diversity across {len(by_source_type)} source types")
        
        return insights
    
    def get_recommendations(
        self,
        documents: List[Dict[str, Any]],
        user_interests: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Recommendation]:
        """Get personalized recommendations from documents."""
        recommendations = []
        
        for doc in documents:
            title = doc.get("title", "")
            description = doc.get("description", "")
            source_type = doc.get("source_type", "unknown")
            
            # Calculate relevance score
            score = 0.5  # Base score
            reasons = []
            
            # Boost for matching interests
            if user_interests:
                full_text = f"{title} {description}".lower()
                matches = [i for i in user_interests if i.lower() in full_text]
                if matches:
                    score += 0.3 * len(matches)
                    reasons.append(f"Matches interests: {', '.join(matches)}")
            
            # Boost for positive sentiment
            sentiment = self.text_analyzer.analyze_sentiment(f"{title} {description}")
            if sentiment == "positive":
                score += 0.1
                reasons.append("Positive sentiment")
            
            # Boost for recent documents
            scraped_at = doc.get("scraped_at")
            if scraped_at:
                try:
                    if isinstance(scraped_at, str):
                        scraped_at = datetime.fromisoformat(scraped_at.replace("Z", "+00:00"))
                    age_days = (datetime.utcnow() - scraped_at.replace(tzinfo=None)).days
                    if age_days < 7:
                        score += 0.1
                        reasons.append("Recently scraped")
                except:
                    pass
            
            if not reasons:
                reasons.append("General recommendation")
            
            recommendations.append(Recommendation(
                id=doc.get("id", ""),
                title=title,
                description=description[:200] if description else "",
                relevance_score=min(score, 1.0),
                source_type=source_type,
                source_url=doc.get("source_url", ""),
                reasons=reasons,
            ))
        
        # Sort by relevance and limit
        recommendations.sort(key=lambda r: r.relevance_score, reverse=True)
        return recommendations[:limit]
    
    def generate_digest(
        self,
        documents: List[Dict[str, Any]],
        period_days: int = 1
    ) -> Dict[str, Any]:
        """Generate a digest of recent activity."""
        trends = self.analyze_trends(documents, period_days)
        
        # Get top documents
        recent_docs = sorted(
            documents,
            key=lambda d: d.get("scraped_at", ""),
            reverse=True
        )[:10]
        
        summaries = [self.summarize_document(doc) for doc in recent_docs[:5]]
        
        return {
            "period": f"Last {period_days} day(s)",
            "generated_at": datetime.utcnow().isoformat(),
            "stats": {
                "total_documents": trends.total_documents,
                "by_source_type": trends.by_source_type,
                "growth_rate": trends.growth_rate,
            },
            "insights": trends.insights,
            "top_keywords": [{"keyword": k, "count": c} for k, c in trends.top_keywords[:10]],
            "highlights": [
                {
                    "title": s.title,
                    "summary": s.summary,
                    "sentiment": s.sentiment,
                    "categories": s.categories,
                }
                for s in summaries
            ],
        }


# Global instance
insights_engine = InsightsEngine()


__all__ = [
    "DocumentSummary",
    "TrendAnalysis",
    "Recommendation",
    "TextAnalyzer",
    "InsightsEngine",
    "insights_engine",
]
