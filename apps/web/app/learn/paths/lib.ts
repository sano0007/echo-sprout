type LessonForm = {
  title: string;
  description: string;
  videoUrl: string;
  pdfs: string;
};

type FormState = {
  title: string;
  description: string;
  objectives: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  tags: string;
  visibility: 'public' | 'private' | 'unlisted';
  coverImageUrl?: string;
  publish: boolean;
  lessons: LessonForm[];
};

function isValidHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateLearningPathForm(f: FormState) {
  const fieldErrors: any = {};
  const messages: string[] = [];

  if (!f.title.trim()) {
    fieldErrors.title = 'Title is required.';
    messages.push(fieldErrors.title);
  } else if (f.title.trim().length < 3) {
    fieldErrors.title = 'Title must be at least 3 characters.';
    messages.push(fieldErrors.title);
  } else if (f.title.trim().length > 120) {
    fieldErrors.title = 'Title must be at most 120 characters.';
    messages.push(fieldErrors.title);
  }

  if (!f.description.trim()) {
    fieldErrors.description = 'Description is required.';
    messages.push(fieldErrors.description);
  } else if (f.description.trim().length < 20) {
    fieldErrors.description = 'Description must be at least 20 characters.';
    messages.push(fieldErrors.description);
  }

  if (!Number.isFinite(f.estimatedDuration)) {
    fieldErrors.estimatedDuration = 'Estimated duration is required.';
    messages.push(fieldErrors.estimatedDuration);
  } else if (
    f.estimatedDuration <= 0 ||
    !Number.isInteger(f.estimatedDuration)
  ) {
    fieldErrors.estimatedDuration = 'Duration must be a positive whole number.';
    messages.push(fieldErrors.estimatedDuration);
  } else if (f.estimatedDuration > 24 * 60) {
    fieldErrors.estimatedDuration =
      'Duration seems too large (max 1440 minutes).';
    messages.push(fieldErrors.estimatedDuration);
  }

  if (f.coverImageUrl && f.coverImageUrl.trim()) {
    if (!isValidHttpUrl(f.coverImageUrl.trim())) {
      fieldErrors.coverImageUrl =
        'Cover Image URL must be a valid http(s) URL.';
      messages.push(fieldErrors.coverImageUrl);
    }
  }

  if (f.tags && f.tags.trim()) {
    const tags = f.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (tags.length > 10) {
      fieldErrors.tags = 'Please use at most 10 tags.';
      messages.push(fieldErrors.tags);
    }
    for (const t of tags) {
      if (t.length < 1 || t.length > 24) {
        fieldErrors.tags = 'Each tag must be between 1 and 24 characters.';
        messages.push(fieldErrors.tags);
        break;
      }
    }
  }

  if (Array.isArray(f.lessons) && f.lessons.length > 0) {
    fieldErrors.lessons = [] as any[];
    f.lessons.forEach((l, idx) => {
      const le: any = {};
      if (!l.title.trim()) {
        le.title = 'Lesson title is required.';
        messages.push(`Lesson ${idx + 1}: ${le.title}`);
      } else if (l.title.trim().length < 3) {
        le.title = 'Lesson title must be at least 3 characters.';
        messages.push(`Lesson ${idx + 1}: ${le.title}`);
      }
      if (
        l.videoUrl &&
        l.videoUrl.trim() &&
        !isValidHttpUrl(l.videoUrl.trim())
      ) {
        le.videoUrl = 'Video URL must be a valid http(s) URL.';
        messages.push(`Lesson ${idx + 1}: ${le.videoUrl}`);
      }
      if (l.pdfs && l.pdfs.trim()) {
        const pdfs = l.pdfs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        for (const p of pdfs) {
          if (!isValidHttpUrl(p)) {
            le.pdfs = 'All PDF URLs must be valid http(s) URLs.';
            messages.push(`Lesson ${idx + 1}: ${le.pdfs}`);
            break;
          }
        }
      }
      fieldErrors.lessons[idx] = le;
    });
  }

  return {
    fieldErrors,
    messages,
    hasErrors: messages.length > 0,
  };
}

export { isValidHttpUrl, validateLearningPathForm, type FormState };
