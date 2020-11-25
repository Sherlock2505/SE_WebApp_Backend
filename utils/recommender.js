const axios = require('axios')
const querystring = require('querystring')

const instance = axios.create({
    baseURL: 'https://blogpred.herokuapp.com/',
});

const recommender = (main_blog, blogs) => {

	const data = querystring.stringify({
		tdoc: blogs,
		mdoc: main_blog
	  })

	  instance
	  .post('pred', data)
	  .then(res => {
        // console.log(res.status)
        // console.log(res.data)
        return res.data
	  })
	  .catch(error => {
        console.error(error.response.status)
        console.error(error.response.data)
        console.error(error.response.headers)
        console.error(error.message)
	  })
}

// main_blog = "Machine learning is the study of computer algorithms that improve automatically through experience.\
// Machine learning algorithms build a mathematical model based on sample data, known as training data.\
// The discipline of machine learning employs various approaches to teach computers to accomplish tasks \
// where no fully satisfactory algorithm is available."

// blogs = ["Machine learning is closely related to computational statistics, which focuses on making predictions using computers.\
// The study of mathematical optimization delivers methods, theory and application domains to the field of machine learning.", "Machine learning involves computers discovering how they can perform tasks without being explicitly programmed to do so. \
// It involves computers learning from data provided so that they carry out certain tasks.", "Machine learning approaches are traditionally divided into three broad categories, depending on the nature of the \"signal\"\
// or \"feedback\" available to the learning system: Supervised, Unsupervised and Reinforcement", "Software engineering is the systematic application of engineering approaches to the development of software.\
// Software engineering is a computing discipline.", "A software engineer creates programs based on logic for the computer to execute. A software engineer has to be more concerned\
// about the correctness of the program in all the cases. Meanwhile, a data scientist is comfortable with uncertainty and variability.\
// Developing a machine learning application is more iterative and explorative process than software engineering."]

module.exports = recommender