import { getAEMPublish, getAEMAuthor } from '../../scripts/endpointconfig.js';

/* eslint-disable no-underscore-dangle */
export default async function decorate(block) {
  const aempublishurl = getAEMPublish();
  const aemauthorurl = getAEMAuthor();
  const persistedquery = '/graphql/execute.json/securbank/OfferByPath';

  const offerLink = block.querySelector(':scope div:nth-child(1) > div a');
  if (!offerLink) return;
  const offerpath = offerLink.innerHTML.trim();

  let variationname = block.querySelector(':scope div:nth-child(2) > div')?.innerHTML.trim();
  if (!variationname) variationname = 'main';

  const isAuthor = window.location && window.location.origin && window.location.origin.includes('author');
  const url = isAuthor
    ? `${aemauthorurl}${persistedquery};path=${offerpath};variation=${variationname};ts=${Math.random() * 1000}`
    : `${aempublishurl}${persistedquery};path=${offerpath};variation=${variationname};ts=${Math.random() * 1000}`;

  try {
    const cfReq = await fetch(url, { credentials: 'include' });
    if (!cfReq.ok) throw new Error(`HTTP ${cfReq.status}`);
    const contentfragment = await cfReq.json();

    let offer = '';
    if (contentfragment.data) {
      offer = contentfragment.data.offerByPath.item;
    }
    if (!offer) return;

    const itemId = `urn:aemconnection:${offerpath}/jcr:content/data/master`;

    block.innerHTML = `
    <div class='banner-content' data-aue-resource=${itemId} data-aue-label="offer content fragment" data-aue-type="reference" data-aue-filter="cf">
        <div data-aue-prop="heroImage" data-aue-label="hero image" data-aue-type="media" class='banner-detail' style="background-image: linear-gradient(90deg,rgba(0,0,0,0.6), rgba(0,0,0,0.1) 80%) ,url(${aempublishurl + offer.heroImage._dynamicUrl});">
            <p data-aue-prop="headline" data-aue-label="headline" data-aue-type="text" class='pretitle'>${offer.headline}</p>
            <p data-aue-prop="pretitle" data-aue-label="pretitle" data-aue-type="text" class='headline'>${offer.pretitle}</p>
            <p data-aue-prop="detail" data-aue-label="detail" data-aue-type="richtext" class='detail'>${offer.detail.plaintext}</p>
        </div>
        <div class='banner-logo'></div>
    </div>`;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Offer block: could not load content fragment', e);
    block.innerHTML = '';
  }
}
