"use strict";

class AccessController {
    signUp = async (req, res, next) => {
        try {
            console.log(`[P]::signUp`, req.body)

            return res.status(201).json({
                code: '20001',
                metadata: {userid: 1}
            })
        } catch (err) {
            console.log(err);
        }
    }
}

// 200 ok
// 201 create

module.exports = new AccessController();