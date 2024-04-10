import sslChecker from 'ssl-checker';

const sslCheck = async (url) => {
  console.log('url = ', url)
  try {
    const check = await sslChecker(url, { method: "GET", port: 443 })  
    const validTo = new Date(check.validTo);
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
    if (validTo < currentDate) {
      return `SSL сертифікат для ${url} просрочений, дата закінчення ${validTo.toLocaleDateString()}`
    } else if (validTo <= sevenDaysAgo && validTo >= currentDate) {
      return `SSL сертифікат для ${url} невдовзі закінчиться, дата закінчення ${validTo.toLocaleDateString()}`
    } else {
      return `SSL сертифікат для ${url} дійсний, дата закінчення ${validTo.toLocaleDateString()}`
    }
  } catch (error) {
    console.log({error, msg: "ERROR"})
    return `Домен ${url} не знайдено! Введіть домен в такомиу вигдяді example.com.ua`
  }
}

export default sslCheck;