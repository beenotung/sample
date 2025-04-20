import { Router } from 'express'
import { LocaleDefinition, Faker, base, allLocales, en } from '@faker-js/faker'
import { hashString } from '../hash'
import httpStatus from 'http-status'

export let jsonRouter: Router = Router()

// TODO use AI to be more adaptive
jsonRouter.get('/', async (req, res) => {
  try {
    // Parse and validate parameters
    let name = (req.query.name as string) || 'user'
    if (typeof name !== 'string') {
      res.status(400)
      res.json({ error: 'name must be a string' })
      return
    }

    let fields = ((req.query.fields as string) || 'id,name')
      .split(',')
      .flatMap(field => field.split('+'))
      .flatMap(field => field.split(' '))
      .filter(field => field.length > 0)
    if (!Array.isArray(fields)) {
      res.status(400)
      res.json({ error: 'fields must be comma-separated strings' })
      return
    }

    let count = Number(req.query.count) || 0
    if (isNaN(count) || count < 0 || count > 100) {
      res.status(400)
      res.json({ error: 'count must be a number between 0 and 100' })
      return
    }

    let locale = (req.query.locale as string) || 'en'
    if (typeof locale !== 'string') {
      res.status(400)
      res.json({ error: 'locale must be a string' })
      return
    }

    let seed = (req.query.seed as string) || String(Date.now())
    if (typeof seed !== 'string') {
      res.status(400)
      res.json({ error: 'seed must be a string' })
      return
    }

    {
      // convert symbol, e.g. zh-TW -> zh_TW
      locale = locale.replace(/-/g, '_')

      // convert casing, e.g. zh_tw -> zh_TW
      let parts = locale.split('_')
      for (let i = 1; i < parts.length; i++) {
        parts[i] = parts[i].toUpperCase()
      }
      locale = parts.join('_')

      // fallback to general locale, e.g. en_XX -> en
      if (!(locale in allLocales) && parts[0] in allLocales) {
        locale = parts[0]
      }

      // fallback HK to TW (both are using Traditional Chinese)
      if (locale === 'zh_HK' && !(locale in allLocales)) {
        locale = 'zh_TW'
      }

      // fallback to alternative locale, e.g. zh_XX -> zh_CN
      if (!(locale in allLocales)) {
        for (let key in allLocales) {
          let prefix = key.split('_')[0]
          if (locale.startsWith(prefix + '_')) {
            locale = key
            break
          }
        }
      }
    }

    let locales: LocaleDefinition[] = []
    if (locale in allLocales) {
      locales.push(allLocales[locale as keyof typeof allLocales])
    }
    locales.push(en, base)

    // Set faker locale and seed
    let faker = new Faker({
      locale: locales,
      seed: hashString(seed),
    })

    // Generate data
    function generateObject() {
      let result: Record<string, any> = {}
      for (let field of fields) {
        try {
          result[field] = generateData(faker, field)
        } catch (error) {
          result[field] = String(error)
        }
      }
      return result
    }

    // Return single object or array based on count
    let data =
      count > 0
        ? Array.from({ length: count }, generateObject)
        : generateObject()
    res.json({ [name]: data })
  } catch (error) {
    console.error(error)
    res.status(500)
    res.json({ error: String(error) })
  }
})

function generateData(faker: Faker, field: string): string | number | boolean {
  // convert from snake_case to camelCase
  field = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

  switch (field) {
    // Basic types
    case 'id':
      return faker.number.int({ min: 1, max: 10_000 })
    case 'uuid':
      return faker.string.uuid()
    case 'boolean':
      return faker.datatype.boolean()
    case 'number':
      return faker.number.int({ min: 0, max: 1000 })
    case 'decimal':
      return faker.number.float({ min: 0, max: 1000, fractionDigits: 2 })
    case 'date':
      return faker.date.past().toISOString()
    case 'time':
      return faker.date.recent().toISOString().split('T')[1]
    case 'datetime':
      return faker.date.recent().toISOString()

    // Person
    case 'name':
      return faker.person.fullName()
    case 'firstName':
      return faker.person.firstName()
    case 'lastName':
      return faker.person.lastName()
    case 'middleName':
      return faker.person.middleName()
    case 'gender':
      return faker.person.gender()
    case 'title':
      return faker.person.prefix()
    case 'jobTitle':
      return faker.person.jobTitle()
    case 'phone':
      return faker.phone.number()
    case 'bio':
      return faker.person.bio()
    case 'avatar':
      return faker.image.avatar()
    case 'age':
      return faker.number.int({ min: 18, max: 80 })
    case 'birthdate':
      return faker.date.birthdate().toISOString()
    case 'zodiac':
      return faker.person.zodiacSign()
    case 'height':
      return faker.number.int({ min: 150, max: 200 })
    case 'weight':
      return faker.number.int({ min: 45, max: 120 })
    case 'bloodType':
      return faker.helpers.arrayElement(['A', 'B', 'AB', 'O'])

    // Internet
    case 'email':
      return faker.internet.email()
    case 'username':
      return faker.internet.username()
    case 'password':
      return faker.internet.password()
    case 'domain':
      return faker.internet.domainName()
    case 'url':
      return faker.internet.url()
    case 'ip':
      return faker.internet.ip()
    case 'ipv6':
      return faker.internet.ipv6()
    case 'mac':
      return faker.internet.mac()
    case 'protocol':
      return faker.internet.protocol()
    case 'userAgent':
      return faker.internet.userAgent()
    case 'emoji':
      return faker.internet.emoji()
    case 'hashtag':
      return faker.helpers.arrayElement([
        ...faker.definitions.word.adjective,
        ...faker.definitions.word.noun,
      ])
    case 'port':
      return faker.internet.port()
    case 'httpMethod':
      return faker.internet.httpMethod()
    case 'httpStatusCode':
      return faker.internet.httpStatusCode()
    case 'httpStatusMessage':
      return httpStatus[faker.number.int({ min: 100, max: 599 }) as 200] || 500

    // Location
    case 'address':
      return faker.location.streetAddress()
    case 'city':
      return faker.location.city()
    case 'state':
      return faker.location.state()
    case 'country':
      return faker.location.country()
    case 'countryCode':
      return faker.location.countryCode()
    case 'zipCode':
      return faker.location.zipCode()
    case 'latitude':
      return faker.location.latitude()
    case 'longitude':
      return faker.location.longitude()
    case 'timezone':
      return faker.location.timeZone()
    case 'street':
      return faker.location.street()
    case 'buildingNumber':
      return faker.location.buildingNumber()
    case 'secondaryAddress':
      return faker.location.secondaryAddress()
    case 'nearbyGPSCoordinate':
      return faker.location.nearbyGPSCoordinate().join(',')
    case 'direction':
      return faker.location.direction()
    case 'cardinalDirection':
      return faker.location.cardinalDirection()

    // Company
    case 'company':
      return faker.company.name()
    case 'companyType':
      return faker.company.buzzNoun()
    case 'department':
      return faker.commerce.department()
    case 'catchPhrase':
      return faker.company.catchPhrase()
    case 'buzzPhrase':
      return faker.company.buzzPhrase()

    // Commerce
    case 'product':
      return faker.commerce.product()
    case 'price':
      return faker.commerce.price()
    case 'currency':
      return faker.finance.currency().code
    case 'amount':
      return faker.finance.amount()
    case 'account':
      return faker.finance.accountNumber()
    case 'transaction':
      return faker.finance.transactionType()
    case 'color':
      return faker.color.human()
    case 'ean':
      return faker.commerce.isbn()
    case 'isbn':
      return faker.commerce.isbn()

    // Content
    case 'word':
      return faker.word.sample()
    case 'words':
      return faker.word.words()
    case 'sentence':
      return faker.lorem.sentence()
    case 'paragraph':
      return faker.lorem.paragraph()
    case 'text':
      return faker.lorem.text()
    case 'slug':
      return faker.lorem.slug()
    case 'lines':
      return faker.lorem.lines()

    // System
    case 'fileName':
      return faker.system.fileName()
    case 'filePath':
      return faker.system.filePath()
    case 'mimeType':
      return faker.system.mimeType()
    case 'fileExt':
      return faker.system.fileExt()
    case 'semver':
      return faker.system.semver()

    // Finance
    case 'creditCard':
      return faker.finance.creditCardNumber()
    case 'creditCardIssuer':
      return faker.finance.creditCardIssuer()
    case 'bitcoinAddress':
      return faker.finance.bitcoinAddress()
    case 'ethereumAddress':
      return faker.finance.ethereumAddress()
    case 'iban':
      return faker.finance.iban()
    case 'bic':
      return faker.finance.bic()
    case 'stockSymbol':
      return faker.helpers.arrayElement([
        'AAPL',
        'TSLA',
        'NVDA',
        'MSFT',
        'GOOG',
        'AMZN',
        'TSM',
        'NFLX',
        'GOOGL',
      ])

    // Vehicle
    case 'vehicle':
      return faker.vehicle.vehicle()
    case 'manufacturer':
      return faker.vehicle.manufacturer()
    case 'model':
      return faker.vehicle.model()
    case 'vin':
      return faker.vehicle.vin()
    case 'fuel':
      return faker.vehicle.fuel()
    case 'type':
      return faker.vehicle.type()

    // Science
    case 'chemicalElement':
      return faker.science.chemicalElement().name
    case 'unit':
      return faker.science.unit().name
    case 'chemicalFormula':
      return faker.science.chemicalElement().symbol

    // Music
    case 'genre':
      return faker.music.genre()
    case 'songName':
      return faker.music.songName()
    case 'artist':
      return faker.person.fullName() // since there's no direct artist generator

    // Fallback
    default:
      return faker.lorem.word()
  }
}
