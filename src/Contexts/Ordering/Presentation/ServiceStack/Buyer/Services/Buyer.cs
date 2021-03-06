﻿using System;
using System.Collections.Generic;
using System.Text;
using Infrastructure.ServiceStack;
using ServiceStack;

namespace eShop.Ordering.Buyer.Services
{
    [Api("Ordering")]
    [Route("/buyer", "GET")]
    public class Buyer : Query<Models.OrderingBuyer>
    {
        public string UserName { get; set; }
    }
}
