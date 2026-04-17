/*eslint-disable*/
import axios from 'axios';
const stripe = Stripe(
  'pk_test_51TMCc2KmBkNBwn4paMey1plxnZtTgkPoXl7u9S22G0xmV2yevUZw2YtTFi9gOwzvWTJOo3k3qVvlEUYnBBMBjC5o00Bs2ix24r',
);

export const bookTour = async (tourId) => {
  //get session from session api
  try {
    console.log(tourId);
    const stripe = Stripe(
      'pk_test_51TMCc2KmBkNBwn4paMey1plxnZtTgkPoXl7u9S22G0xmV2yevUZw2YtTFi9gOwzvWTJOo3k3qVvlEUYnBBMBjC5o00Bs2ix24r',
    );
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // redriect
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
  }
};
