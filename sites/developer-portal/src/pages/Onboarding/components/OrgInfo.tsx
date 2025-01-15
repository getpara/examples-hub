import { CenteredText } from '../../../components/common';
import { ImageUpload } from '../../../components/ImageUpload/ImageUpload';
import { orgQuestions } from '../config/questionConfig';
import { InnerOnboardingContainer } from './common';
import { Controls } from './Controls';
import { QuestionInput } from './QuestionInput';
import { useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';

export const OrgInfo = () => {
  const setLogoFile = useOnboardingStore(state => state.setLogoFile);

  const handleRemoveImage = () => {};

  return (
    <>
      <CenteredText variant="headingS" weight="semiBold">
        Almost there!
      </CenteredText>
      <InnerOnboardingContainer>
        {orgQuestions.map(q => (
          <QuestionInput key={q} question={q} />
        ))}
        <ImageUpload
          recommendedSize={{ height: 64, width: 64 }}
          uploadImage={file => {
            setLogoFile(file);
            return Promise.resolve(true);
          }}
          label="Logo (Optional)"
          onRemoveImage={handleRemoveImage}
        />
        <Controls questions={orgQuestions} />
      </InnerOnboardingContainer>
    </>
  );
};
