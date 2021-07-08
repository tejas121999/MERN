const express = require('express');
const router = express.Router();
const request = require('request');
const cconfig = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth')

const Profile = require('../../model/Profile')
const User = require('../../model/User')

// @route  GET api/profile
// @desc   Test route
// @access public

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',
            ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'there is no profile for the user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error');
    }
});

// @route  POST api/profile
// @desc   Create update user profile
// @access private

router.post('/',
    [auth,
        [
            check('status', 'status is required')
                .not()
                .isEmpty(),
            check('skills', 'Skilla is required')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // Build profile object 
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // build social object 
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = status;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                // update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );

                return res.json(profile)
            }

            // create
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error')
        }

    }
);

// @route  GET api/profile
// @desc   Test route
// @access public

router.get('/', auth, async (req, res) => {
    try {
        const profiles = await Profile.find({ user: req.user.id }).populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error');
    }
});

// @route  GET api/profile/user/:user_id
// @desc   get all profile by user id
// @access public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne
            ({ user: req.params.user_id })
            .populate('user', ['name', 'avatar']);

        if (!profile)
            return res.status(400).json({ msg: "there is no profile for thes user" });

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: "profile is not found" });
        }
        res.status(500).send('Server Error');
    }
});

// @route  DELETE api/profile
// @desc   delete profile user and posts 
// @access public

router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove user post
        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        // remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'user Deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error');
    }
});

// @route  PUT api/profile/experience
// @desc   add profile experience 
// @access private
router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'title is require')
                .not()
                .isEmpty(),
            check('company', 'company name is require')
                .not()
                .isEmpty(),
            check('from', 'date is require')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            res.json(profile)
        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error')
        }
    }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // get remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexof(req.params.exp_id);

        profile, experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
    '/education',
    auth,
    check('school', 'School is required').notEmpty(),
    check('degree', 'Degree is required').notEmpty(),
    check('fieldofstudy', 'Field of study is required').notEmpty(),
    check('from', 'From date is required and needs to be from the past')
        .notEmpty()
        .custom((value, { req }) => (req.body.to ? value < req.body.to : true)),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(req.body);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const foundProfile = await Profile.findOne({ user: req.user.id });
        foundProfile.education = foundProfile.education.filter(
            (edu) => edu._id.toString() !== req.params.edu_id
        );
        await foundProfile.save();
        return res.status(200).json(foundProfile);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
    try {
      const uri = encodeURI(
        `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
      );
      const headers = {
        'user-agent': 'node.js',
        Authorization: `token ${config.get('githubToken')}`
      };
  
      const gitHubResponse = await axios.get(uri, { headers });
      return res.json(gitHubResponse.data);
    } catch (err) {
      console.error(err.message);
      return res.status(404).json({ msg: 'No Github profile found' });
    }
  });

module.exports = router;