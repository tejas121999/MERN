const express = require('express');
const router = express.Router();
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

module.exports = router;