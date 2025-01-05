# Dice Roll

[![CI/CD Pipeline](https://github.com/igor-couto/dice-roll/actions/workflows/pipeline.yml/badge.svg)](https://github.com/igor-couto/dice-roll/actions/workflows/pipeline.yml)

This project was created as a playground to experiment with CSS animations, explore .NET 9, and utilize the `Cryptography.RandomNumberGenerator` instead of `System.Random`.

While Random is generally more performant and suitable for typical use cases, RandomNumberGenerator offers cryptographically secure randomness, which ensures higher unpredictability. It's completely unnecessary here but I wanted to test it anyway 😀


Check out the live version of the project here: [https://igorcouto.com/projects/dice-roll](https://igorcouto.com/projects/dice-roll)

![Dice Roll Screenshot](https://github.com/igor-couto/dice-roll/blob/main/docs/screenshot.webp)

## Features

- **Backend** powered by .NET 9 with a minimalist API endpoint for dice rolls.
- **Frontend** crafted with HTML, CSS, and JavaScript, featuring an animated dice roll.
- Utilizes `RandomNumberGenerator` for secure and unpredictable dice outcomes.
- Deployment pipeline using GitHub Packages and Github Container Registry.
- Deployed on my personal web server.


## Contributing

Feel free to open issues or submit pull requests to improve the project. Contributions are welcome!

## Author

* **Igor Couto** - [igor.fcouto@gmail.com](mailto:igor.fcouto@gmail.com)
