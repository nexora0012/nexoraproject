const User = require('../models/User');

// Get all users
const getUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: 'Server Error',
        });

    }
};

// Get single user
const getUser = async (req, res) => {

    try {

        const user = await User.findById(req.params.id)
            .select('-password');

        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User Not Found',
            });

        }

        res.json({
            success: true,
            user,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server Error',
        });

    }

};

const updateUser = async (req, res) => {

    try {

        const {
            fullName,
            mobile,
            isActive,
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                fullName,
                mobile,
                isActive,
            },
            {
                new: true,
            }
        ).select('-password');

        res.json({
            success: true,
            user,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server Error',
        });

    }

};

const deleteUser = async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User Deleted',
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server Error',
        });

    }

};

const searchUsers = async (req, res) => {

    try {

        const keyword = req.query.keyword || '';

        const users = await User.find({

            $or: [

                {
                    fullName: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },

                {
                    email: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },

            ],

        }).select('-password');

        res.json({
            success: true,
            users,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server Error',
        });

    }

};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    searchUsers,
};