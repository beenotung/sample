# Sample Data API

A simple API service that generates sample data for placeholders, testing, or database seeding.

Visit [https://sample.hkit.cc](https://sample.hkit.cc) for:

- Interactive API URL builder
- Live preview of API responses
- API documentation with examples
- Field reference and usage guides

**Remark**:

All APIs support `seed` parameter for stable results.

### Image API

`GET /image`

This API searches online for images matching your keyword and redirects to a result. Results are cached for stable responses. Powered by [wsrv.nl](https://images.weserv.nl/).

Parameters:

- `keyword` - Search term for the image (default: 'image')
- `w` - Width of the image (optional, original width if not specified)
- `h` - Height of the image (optional, original height if not specified)
- `seed` - For stable results (optional, random if not specified)

Example:

https://sample.hkit.cc/image?keyword=cat&w=800&h=600

### JSON API

`GET /json`

Returns structured data in JSON format with locale-aware values. Returns array when count specified, otherwise single object.

Parameters:

- `name` - Name of the data object (default: 'user')
- `fields` - Comma/space/plus separated list of fields (default: 'id,name')
- `count` - Number of objects to generate (0-100, optional, single object if not specified)
- `locale` - Locale for generating data (default: 'en')
- `seed` - For stable results (optional, random if not specified)
- `remark` - Guide for AI generation (coming soon)

Example:

https://sample.hkit.cc/json?name=users&fields=id+name+title+email+company+address&count=10&locale=zh-HK

Response:

```json
{
  "users": [
    {
      "id": 1234,
      "name": "張小明",
      "title": "高級工程師",
      "email": "xiaoming.zhang@example.com",
      "company": "創新科技有限公司",
      "address": "香港九龍灣宏光道1號"
    }
  ]
}
```

Currently using [Faker.js](https://fakerjs.dev/) for data generation. Will be enhanced with AI-powered generation in the future.

Field separators can be comma, plus sign, or space:

```
fields=id,name,title
fields=id+name+title
fields=id name title
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start

# Bundle client-side code
pnpm run bundle

# Bundle client-side code with watch mode
pnpm run dev
```

## Environment Variables

Create a `.env` file:

```
PORT=8100
```

## Author

Made with ❤️ by [Beeno Tung](https://beeno-tung.surge.sh/)

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
