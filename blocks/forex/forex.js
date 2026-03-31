export default async function decorate(block) {
  const props = [...block.children];
  const firsttag = props[0].textContent.trim();
  const container = document.createElement('table');
  const url = `https://20092-securbankdemo-stage.adobeio-static.net/api/v1/web/dx-excshell-1/forex?baseCurrency=${firsttag}`;
  try {
    const forexReq = await fetch(url);
    const index = await forexReq.json();
    index.currencies
      .forEach((currency) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><img src="/icons/flag-${currency.currencyCode}.svg" alt="Flag for ${currency.currencyCode}"></td>
          <td>${currency.currencyTitle}</td>
          <td>${currency.currencyCode}</td>
          <td>${currency.forex}</td>
        `;
        container.append(tr);
      });
    block.innerHTML = `<h2 class="forex-heading">Exchange Rates for the ${index.title}</h2>`;
    block.append(container);
  } catch (e) {
    block.textContent = '';
  }
}
