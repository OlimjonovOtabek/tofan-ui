import { maxLength, required, schema, validate } from '@angular/forms/signals';
import { POST_TEXT_MAX, POST_TITLE_MAX } from '../../models/post';
import { PostDraft } from '../../models/post-draft';

const TITLE_REQUIRED = 'coachApp.posts.titleRequired';

export const postEditorSchema = schema<PostDraft>((path) => {
  required(path.title, { message: TITLE_REQUIRED });
  validate(path.title, ({ value }) =>
    value().trim().length > 0 ? null : { kind: 'blank', message: TITLE_REQUIRED },
  );
  maxLength(path.title, POST_TITLE_MAX);
  maxLength(path.text, POST_TEXT_MAX);
});
