/* eslint-disable */
import { showAlert } from './alerts.js';
const stripe = Stripe('pk_test_51HftM2Hr1ZCotBHuiTWH6VTJ4SRZHQ3qQSKBnchjMxtCHF7ZNOuHtJboORDF6Ub321kdnORQdmQM7KsahZRjzjgO00XbalsySx');

export const kupovanjePonude = async (ponudaId, brojKarata, dodatak, sobe, datum, rezervacijaId) => {
  try {
    axios.defaults.headers.post['Content-Type'] = 'text/plain';
    console.log(`${ponudaId}--${brojKarata}--${dodatak}--${sobe}--${datum}`);
     // 1) Get checkout session from API
    const session = await axios.get(
      `/rezervacije/kupovinska-sesija/${ponudaId}--${brojKarata}--${dodatak}--${sobe}--${datum}--${rezervacijaId}`, 
    );
 
    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
 
};
