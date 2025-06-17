import { useCallback } from "react";

type WheelMode = "simple" | "teams" | "weighted" | "multiple";

interface WheelItem {
  id: string;
  name: string;
  weight?: number;
}

// Add team constraint interface
interface TeamConstraint {
  id: string;
  item1Id: string;
  item2Id: string;
  type: "avoid" | "separate";
}

interface WheelConfig {
  mode: WheelMode;
  items: WheelItem[];
  teamCount?: number;
  selectCount?: number;
  removeAfterSpin?: boolean;
  teamConstraints?: TeamConstraint[]; // Add constraints support
}

/**
 * Custom hook for wheel sharing functionality
 * Handles URL generation, parsing, and sharing operations
 */
export const useWheelShare = () => {
  /**
   * Generate a shareable URL from wheel configuration
   */
  const generateShareUrl = useCallback((config: WheelConfig): string => {
    if (typeof window === "undefined") return "";
    
    const params = new URLSearchParams({
      mode: config.mode,
      items: JSON.stringify(config.items.map(item => ({ 
        name: item.name, 
        weight: item.weight 
      }))),
      ...(config.teamCount && { teamCount: config.teamCount.toString() }),
      ...(config.selectCount && { selectCount: config.selectCount.toString() }),
      ...(config.removeAfterSpin && { removeAfterSpin: "true" }),
      ...(config.teamConstraints && config.teamConstraints.length > 0 && {
        teamConstraints: JSON.stringify(config.teamConstraints)
      }),
    });
    
    return `${window.location.origin}/setup?${params.toString()}`;
  }, []);

  /**
   * Parse configuration from URL parameters
   */
  const parseConfigFromUrl = useCallback((): Partial<WheelConfig> | null => {
    if (typeof window === "undefined") return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    
    if (!urlParams.has('mode') && !urlParams.has('items')) {
      return null;
    }
    
    try {
      const items = urlParams.has('items') 
        ? JSON.parse(urlParams.get('items') || '[]')
        : [];
      
      // Add IDs to items if they don't have them
      const itemsWithIds = items.map((item: Partial<WheelItem>, index: number) => ({
        ...item,
        id: item.id || `${Date.now()}-${index}`,
      }));

      // Parse team constraints if present
      let teamConstraints: TeamConstraint[] | undefined;
      if (urlParams.has('teamConstraints')) {
        try {
          const constraintsData = JSON.parse(urlParams.get('teamConstraints') || '[]') as TeamConstraint[];
          teamConstraints = constraintsData.map((constraint: TeamConstraint, index: number) => ({
            ...constraint,
            id: constraint.id || `constraint-${Date.now()}-${index}`,
          }));
        } catch (error) {
          console.error("Failed to parse team constraints:", error);
          teamConstraints = undefined;
        }
      }

      return {
        mode: (urlParams.get('mode') as WheelMode) || 'simple',
        items: itemsWithIds,
        teamCount: urlParams.has('teamCount') 
          ? parseInt(urlParams.get('teamCount') || '2') 
          : undefined,
        selectCount: urlParams.has('selectCount') 
          ? parseInt(urlParams.get('selectCount') || '1') 
          : undefined,
        removeAfterSpin: urlParams.get('removeAfterSpin') === 'true',
        teamConstraints,
      };
    } catch (error) {
      console.error("Failed to parse shared config:", error);
      return null;
    }
  }, []);

  /**
   * Copy text to clipboard with error handling
   */
  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  }, []);

  /**
   * Generate social media sharing URLs
   */
  const getSocialShareUrl = useCallback((platform: string, shareUrl: string, customText?: string) => {
    const defaultText = "Check out my custom wheel configuration on WheelIt!";
    const text = encodeURIComponent(customText || defaultText);
    const url = encodeURIComponent(shareUrl);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      reddit: `https://reddit.com/submit?url=${url}&title=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    
    return urls[platform as keyof typeof urls];
  }, []);

  /**
   * Handle native Web Share API with fallback
   */
  const handleNativeShare = useCallback(async (title: string, text: string, url: string): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return true;
      } catch (error) {
        console.error("Native sharing failed:", error);
        return false;
      }
    }
    
    // Fallback to clipboard
    return copyToClipboard(`${text}\n\n${url}`);
  }, [copyToClipboard]);

  /**
   * Clean URL parameters after loading shared configuration
   */
  const cleanUrlParameters = useCallback(() => {
    if (typeof window === "undefined") return;
    
    const url = new URL(window.location.href);
    const hasShareParams = url.searchParams.has('mode') || url.searchParams.has('items');
    
    if (hasShareParams) {
      // Remove share parameters from URL without refreshing the page
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  return {
    generateShareUrl,
    parseConfigFromUrl,
    copyToClipboard,
    getSocialShareUrl,
    handleNativeShare,
    cleanUrlParameters,
  };
}; 