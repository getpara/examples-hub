import { InfoAlert } from '../../../../../components/InfoAlert';
import { Link } from 'react-router-dom';
import { MODAL_CUSTOMIZATION_DOCS_LINK } from '../../../../../utils/constants';

export const ModalStyleAlert = () => {
  return (
    <InfoAlert
      title="Styling the Modal"
      content={
        <span>
          Branding and styling of your Para Modal is configured in your code using the Para SDK. See our{' '}
          <Link
            to={MODAL_CUSTOMIZATION_DOCS_LINK}
            target="_blank"
            className="para:underline para:text-primary para:underline-offset-3"
          >
            styling guide
          </Link>
          .
        </span>
      }
    />
  );
};
